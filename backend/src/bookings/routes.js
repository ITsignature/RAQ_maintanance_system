const express = require("express");
const { z } = require("zod");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");
const { createBookingWithStaff } = require("./service");

const router = express.Router();

// Inline validation schemas
const createBookingSchema = z.object({
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "booking_date must be YYYY-MM-DD"),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "start_time must be HH:mm or HH:mm:ss"),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "end_time must be HH:mm or HH:mm:ss"),

  customer_id: z.number().int().positive(),
  service_name: z.string().min(2).max(150),
  service_amount: z.number().nonnegative(),
  note: z.string().optional().nullable(),

  staff_ids: z.array(z.number().int().positive()).optional().default([]),
});

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});


// ────────────────────────────────────────────────
//               Reuseable partial schema
// ────────────────────────────────────────────────
const bookingUpdateSchema = z.object({
  customer_id: z.number().int().positive().optional(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  service_name: z.string().min(1).max(150).optional(),
  service_amount: z.number().nonnegative().optional(),
  note: z.union([z.string(), z.null()]).optional(),
  status: z.enum(["Scheduled", "In Progress", "Completed", "Cancelled"]).optional(),
  staff_ids: z.array(z.number().int().positive()).optional(),
}).refine(
  (data) => {
    // If any time-related field is provided, require the others too
    const timeFields = [data.start_time, data.end_time, data.booking_date];
    const someTimeProvided = timeFields.some(Boolean);
    const allTimeProvided = timeFields.every(Boolean);
    return !someTimeProvided || allTimeProvided;
  },
  {
    message: "If updating date/time, all three fields (date, start_time, end_time) must be provided",
    path: ["start_time"],
  }
);
// Create booking (+ assign staff)
router.post(
  "/",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation error" });
    }

    const { staff_ids, ...booking } = parsed.data;

    if (booking.end_time <= booking.start_time) {
      return res.status(400).json({ message: "end_time must be after start_time" });
    }

    // 🔒 STAFF-SPECIFIC CONFLICT CHECK
    // Only check for conflicts if staff members are assigned
    if (staff_ids && staff_ids.length > 0) {
      const [conflicts] = await pool.query(
        `SELECT DISTINCT
          b.id as booking_id,
          b.start_time,
          b.end_time,
          u.name as staff_name,
          bs.staff_id
         FROM bookings b
         JOIN booking_staff bs ON bs.booking_id = b.id
         JOIN users u ON u.id = bs.staff_id
         WHERE b.booking_date = ?
           AND b.is_active = TRUE
           AND bs.staff_id IN (?)
           AND (b.start_time < ? AND b.end_time > ?)`,
        [
          booking.booking_date,
          staff_ids,
          booking.end_time,
          booking.start_time
        ]
      );

      if (conflicts.length > 0) {
        // Group conflicts by staff member
        const conflictDetails = conflicts.map(c => ({
          staff_id: c.staff_id,
          staff_name: c.staff_name,
          booking_id: c.booking_id,
          time: `${c.start_time.substring(0, 5)} - ${c.end_time.substring(0, 5)}`
        }));

        return res.status(409).json({
          message: "Staff scheduling conflict detected",
          conflicts: conflictDetails
        });
      }
    }

    // No conflicts - proceed with booking creation
    const bookingId = await createBookingWithStaff({
      booking,
      staff_ids,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "Booking created", booking_id: bookingId });
  })
);

//Get booking by id
router.get('/:id', requireAuth, requireRole(1, 2, 3), asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const [rows] = await pool.query(
    'SELECT * FROM bookings WHERE id = ? AND is_active = TRUE',
    [bookingId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  res.json(rows[0]);
}));


// List active bookings with pagination and date filter
router.get(
  "/",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const { page = 1, date } = req.query; // Get page number from query
    const perPage = 50; // 50 per page
    const offset = (page - 1) * perPage;

    let whereClause = 'WHERE is_active=TRUE';

    // Apply date filter if provided
    if (date) {
      whereClause += ` AND booking_date LIKE '${date}%'`;
    }

    const [rows] = await pool.query(
      `SELECT * FROM bookings ${whereClause} ORDER BY booking_date DESC, start_time DESC LIMIT ? OFFSET ?`,
      [perPage, offset]
    );

    const [totalRows] = await pool.query(`SELECT COUNT(*) AS total FROM bookings ${whereClause}`);
    const totalBookings = totalRows[0]?.total || 0;

    res.json({
      bookings: rows,
      total: totalBookings,
      page: Number(page),
      totalPages: Math.ceil(totalBookings / perPage),
    });
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const parsed = bookingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // ─── 1. Optional: Conflict check if date/time is being changed ───────
    if (data.booking_date || data.start_time || data.end_time) {
      const [[current]] = await pool.query(
        "SELECT booking_date, start_time, end_time FROM bookings WHERE id = ? AND is_active = TRUE",
        [bookingId]
      );

      if (!current) {
        return res.status(404).json({ message: "Booking not found or already deleted" });
      }

      const checkDate = data.booking_date || current.booking_date;
      const checkStart = data.start_time || current.start_time;
      const checkEnd = data.end_time || current.end_time;

      if (checkEnd <= checkStart) {
        return res.status(400).json({ message: "end_time must be after start_time" });
      }

      // Get staff IDs - either new ones being assigned or existing ones
      let staffIdsToCheck = [];
      if (data.staff_ids !== undefined) {
        staffIdsToCheck = data.staff_ids;
      } else {
        // Get current staff assignments
        const [currentStaff] = await pool.query(
          "SELECT staff_id FROM booking_staff WHERE booking_id = ?",
          [bookingId]
        );
        staffIdsToCheck = currentStaff.map(s => s.staff_id);
      }

      // Only check conflicts if there are staff assigned
      if (staffIdsToCheck.length > 0) {
        const [conflicts] = await pool.query(
          `SELECT DISTINCT
            b.id as booking_id,
            b.start_time,
            b.end_time,
            u.name as staff_name,
            bs.staff_id
           FROM bookings b
           JOIN booking_staff bs ON bs.booking_id = b.id
           JOIN users u ON u.id = bs.staff_id
           WHERE b.id != ?
             AND b.is_active = TRUE
             AND b.booking_date = ?
             AND bs.staff_id IN (?)
             AND (b.start_time < ? AND b.end_time > ?)`,
          [bookingId, checkDate, staffIdsToCheck, checkEnd, checkStart]
        );

        if (conflicts.length > 0) {
          const conflictDetails = conflicts.map(c => ({
            staff_id: c.staff_id,
            staff_name: c.staff_name,
            booking_id: c.booking_id,
            time: `${c.start_time.substring(0, 5)} - ${c.end_time.substring(0, 5)}`
          }));

          return res.status(409).json({
            message: "Staff scheduling conflict detected",
            conflicts: conflictDetails
          });
        }
      }
    }

    // ─── 2. Handle staff reassignment conflict check (if only staff is changing) ───
    if (data.staff_ids !== undefined && !data.booking_date && !data.start_time && !data.end_time) {
      // Get current booking time
      const [[current]] = await pool.query(
        "SELECT booking_date, start_time, end_time FROM bookings WHERE id = ? AND is_active = TRUE",
        [bookingId]
      );

      if (!current) {
        return res.status(404).json({ message: "Booking not found or already deleted" });
      }

      // Check if new staff have conflicts
      if (data.staff_ids.length > 0) {
        const [conflicts] = await pool.query(
          `SELECT DISTINCT
            b.id as booking_id,
            b.start_time,
            b.end_time,
            u.name as staff_name,
            bs.staff_id
           FROM bookings b
           JOIN booking_staff bs ON bs.booking_id = b.id
           JOIN users u ON u.id = bs.staff_id
           WHERE b.id != ?
             AND b.is_active = TRUE
             AND b.booking_date = ?
             AND bs.staff_id IN (?)
             AND (b.start_time < ? AND b.end_time > ?)`,
          [
            bookingId,
            current.booking_date,
            data.staff_ids,
            current.end_time,
            current.start_time
          ]
        );

        if (conflicts.length > 0) {
          const conflictDetails = conflicts.map(c => ({
            staff_id: c.staff_id,
            staff_name: c.staff_name,
            booking_id: c.booking_id,
            time: `${c.start_time.substring(0, 5)} - ${c.end_time.substring(0, 5)}`
          }));

          return res.status(409).json({
            message: "Staff scheduling conflict detected",
            conflicts: conflictDetails
          });
        }
      }
    }

    // ─── 3. Build dynamic UPDATE query for booking table ─────────────────
    const updates = [];
    const values = [];

    if (data.customer_id !== undefined) {
      updates.push("customer_id = ?");
      values.push(data.customer_id);
    }
    if (data.booking_date) {
      updates.push("booking_date = ?");
      values.push(data.booking_date);
    }
    if (data.start_time) {
      updates.push("start_time = ?");
      values.push(data.start_time);
    }
    if (data.end_time) {
      updates.push("end_time = ?");
      values.push(data.end_time);
    }
    if (data.service_name) {
      updates.push("service_name = ?");
      values.push(data.service_name);
    }
    if (data.service_amount !== undefined) {
      updates.push("service_amount = ?");
      values.push(data.service_amount);
    }
    if (data.note !== undefined) {
      updates.push("note = ?");
      values.push(data.note);
    }
    if (data.status) {
      updates.push("status = ?");
      values.push(data.status);
    }

    // Always update timestamp
    updates.push("updated_at = NOW()");

    if (updates.length > 0) {
      values.push(bookingId);
      await pool.query(
        `UPDATE bookings
         SET ${updates.join(", ")}
         WHERE id = ? AND is_active = TRUE`,
        values
      );
    }

    // ─── 4. Handle staff reassignment (replace all) ───────────────────────
    if (data.staff_ids !== undefined) {
      await pool.query("DELETE FROM booking_staff WHERE booking_id = ?", [bookingId]);

      if (data.staff_ids.length > 0) {
        const staffValues = data.staff_ids.map((sid) => [bookingId, sid]);
        await pool.query(
          "INSERT INTO booking_staff (booking_id, staff_id) VALUES ?",
          [staffValues]
        );
      }
    }

    // ─── 5. Return success ───────────────────────────────────────────────
    res.json({
      message: "Booking updated successfully",
      booking_id: bookingId,
    });
  })
);

// Update booking status
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });

    await pool.query(
      `UPDATE bookings SET status=? WHERE id=? AND is_active=TRUE`,
      [parsed.data.status, req.params.id]
    );

    res.json({ message: "Status updated" });
  })
);

// Soft delete booking (admin/super)
router.delete(
  "/:id",
  requireAuth,
  requireRole(1, 2),
  asyncHandler(async (req, res) => {
    const bookingId = req.params.id;

    // Step 1: Check if there are any payments for this booking
    const [payments] = await pool.query(
      `SELECT id FROM payments WHERE booking_id=? AND is_active=TRUE`,
      [bookingId]
    );

    if (payments.length > 0) {
      // Step 2: If payments exist, return a message to delete payments first
      return res.status(400).json({
        message: 'Please delete associated payments before deleting the booking.',
      });
    }

    // Step 3: Perform the soft delete on the booking
    await pool.query(`UPDATE bookings SET is_active=FALSE WHERE id=?`, [bookingId]);

    res.json({ message: "Booking deleted (soft)" });
  })
);


// GET /api/bookings/:id/staff
router.get('/:id/staff', requireAuth, requireRole(1, 2, 3), asyncHandler(async (req, res) => {
  const bookingId = req.params.id;

  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.phone_no
     FROM users u
     JOIN booking_staff bs ON u.id = bs.staff_id
     WHERE bs.booking_id = ? AND u.is_active = 1`, [bookingId]
  );

  res.json(rows);
}));


module.exports = router;

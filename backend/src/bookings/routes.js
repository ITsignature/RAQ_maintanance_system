const express = require("express");
const { z } = require("zod");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");
const { createBookingWithStaff } = require("./service");

const router = express.Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

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

const bookingUpdateSchema = z.object({
  customer_id: z.number().int().positive().optional(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  service_name: z.string().min(1).max(150).optional(),
  service_amount: z.number().nonnegative().optional(),
  note: z.union([z.string(), z.null()]).optional(),
  staff_ids: z.array(z.number().int().positive()).optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
}).refine(
  (data) => {
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

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

// ============================================
// ROUTES
// ============================================

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

    // Staff-specific conflict check
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
         WHERE DATE(b.booking_date) = ?
           AND b.is_active = TRUE
           AND bs.staff_id IN (?)
           AND (b.start_time < ? AND b.end_time > ?)`,
        [booking.booking_date, staff_ids, booking.end_time, booking.start_time]
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

    const bookingId = await createBookingWithStaff({
      booking,
      staff_ids,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "Booking created", booking_id: bookingId });
  })
);

// Get booking by id
router.get(
  '/:id',
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const bookingId = req.params.id;

    console.log(bookingId);
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date,
        start_time,
        end_time,
        customer_id,
        service_name,
        service_amount,
        note,
        status,
        payment_status,
        is_active,
        created_by,
        created_at,
        updated_at
       FROM bookings 
       WHERE id = ? AND is_active = TRUE`,
      [bookingId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(rows[0]);
  })
);

// List active bookings with pagination and date filter
router.get(
  "/",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const { page = 1, from, to } = req.query;

    const perPage = 50;
    const offset = (page - 1) * perPage;

    let whereClause = 'WHERE is_active = TRUE';
    const params = []; // ✅ FIX: initialize params

    // Apply date range filter
    if (from && to) {
      whereClause += ' AND DATE(booking_date) BETWEEN ? AND ?';
      params.push(from, to);
    }

    // Fetch paginated bookings
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        DATE_FORMAT(booking_date, '%Y-%m-%d') AS booking_date,
        start_time,
        end_time,
        customer_id,
        service_name,
        service_amount,
        note,
        status,
        payment_status,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM bookings
      ${whereClause}
      ORDER BY booking_date DESC, start_time DESC
      LIMIT ? OFFSET ?
      `,
      [...params, perPage, offset]
    );

    // Count total
    const [totalRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM bookings ${whereClause}`,
      params
    );

    const totalBookings = totalRows[0]?.total || 0;

    res.json({
      bookings: rows,
      total: totalBookings,
      page: Number(page),
      totalPages: Math.ceil(totalBookings / perPage),
    });
  })
);


// Edit booking
router.patch(
  "/:id",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      console.log(bookingId);
      return res.status(400).json({ message: "Invalid booking ID" });
      
    }


    console.log(req.body);
    const parsed = bookingUpdateSchema.safeParse(req.body);
    console.log(parsed);  

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    

    console.log("data",data);

    // Conflict check if date/time is being changed
    if (data.booking_date || data.start_time || data.end_time) {
      const [[current]] = await pool.query(
        "SELECT DATE(booking_date) as booking_date, start_time, end_time FROM bookings WHERE id = ? AND is_active = TRUE",
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

      // Get staff IDs
      let staffIdsToCheck = [];
      if (data.staff_ids !== undefined) {
        staffIdsToCheck = data.staff_ids;
      } else {
        const [currentStaff] = await pool.query(
          "SELECT staff_id FROM booking_staff WHERE booking_id = ?",
          [bookingId]
        );
        staffIdsToCheck = currentStaff.map(s => s.staff_id);
      }

      // Check conflicts if there are staff assigned
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
             AND DATE(b.booking_date) = ?
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

    // Handle staff reassignment conflict check
    if (data.staff_ids !== undefined && !data.booking_date && !data.start_time && !data.end_time) {
      const [[current]] = await pool.query(
        "SELECT DATE(booking_date) as booking_date, start_time, end_time FROM bookings WHERE id = ? AND is_active = TRUE",
        [bookingId]
      );

      if (!current) {
        return res.status(404).json({ message: "Booking not found or already deleted" });
      }

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
             AND DATE(b.booking_date) = ?
             AND bs.staff_id IN (?)
             AND (b.start_time < ? AND b.end_time > ?)`,
          [bookingId, current.booking_date, data.staff_ids, current.end_time, current.start_time]
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

    // Build dynamic UPDATE query
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
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }


    updates.push("updated_at = NOW()");

    if (updates.length > 0) {
      values.push(bookingId);
      await pool.query(
        `UPDATE bookings SET ${updates.join(", ")} WHERE id = ? AND is_active = TRUE`,
        values
      );
    }

    // Handle staff reassignment
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

// Soft delete booking
router.delete(
  "/:id",
  requireAuth,
  requireRole(1, 2),
  asyncHandler(async (req, res) => {
    const bookingId = req.params.id;

    // Check if there are any payments for this booking
    const [payments] = await pool.query(
      `SELECT id FROM payments WHERE booking_id=? AND is_active=TRUE`,
      [bookingId]
    );

    if (payments.length > 0) {
      return res.status(400).json({
        message: 'Please delete associated payments before deleting the booking.',
      });
    }

    await pool.query(`UPDATE bookings SET is_active=FALSE WHERE id=?`, [bookingId]);

    res.json({ message: "Booking deleted (soft)" });
  })
);

// Get staff for a booking
router.get(
  '/:id/staff',
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const bookingId = req.params.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.phone_no
       FROM users u
       JOIN booking_staff bs ON u.id = bs.staff_id
       WHERE bs.booking_id = ? AND u.is_active = 1`,
      [bookingId]
    );

    res.json(rows);
  })
);

module.exports = router;
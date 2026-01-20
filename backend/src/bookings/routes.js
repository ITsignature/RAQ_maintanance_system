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

    // 🔒 CONFLICT CHECK
    const [[conflict]] = await pool.query(
      `SELECT id FROM bookings
       WHERE booking_date = ?
         AND is_active = TRUE
         AND (start_time < ? AND end_time > ?)
       LIMIT 1`,
      [booking.booking_date, booking.end_time, booking.start_time]
    );

    if (conflict) {
      return res.status(409).json({
        message: "Booking time conflict",
        conflict_booking_id: conflict.id,
      });
    }

    const bookingId = await createBookingWithStaff({
      booking,
      staff_ids,
      created_by: req.user.id,
    });

    res.status(201).json({ message: "Booking created", booking_id: bookingId });
  })
);

// List active bookings
router.get(
  "/",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT * FROM bookings
       WHERE is_active=TRUE
       ORDER BY booking_date DESC, start_time DESC`
    );
    res.json(rows);
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
    await pool.query(`UPDATE bookings SET is_active=FALSE WHERE id=?`, [req.params.id]);
    res.json({ message: "Booking deleted (soft)" });
  })
);

module.exports = router;

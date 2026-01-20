const express = require("express");
const { z } = require("zod");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");
const { recalcPaymentStatus } = require("./service");

const router = express.Router();

const createPaymentSchema = z.object({
  booking_id: z.number().int().positive(),
  amount: z.number().positive(),
  method: z.string().max(40).optional().nullable(),
  reference_no: z.string().max(100).optional().nullable(),
  note: z.string().optional().nullable(),
});

// Add payment
router.post(
  "/",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const parsed = createPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const { booking_id, amount, method, reference_no, note } = parsed.data;

    // Ensure booking exists & active
    const [[bk]] = await pool.query(
      `SELECT id FROM bookings WHERE id=? AND is_active=TRUE LIMIT 1`,
      [booking_id]
    );
    if (!bk) return res.status(404).json({ message: "Booking not found" });

    await pool.query(
      `INSERT INTO payments
       (booking_id, amount, method, reference_no, note, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [booking_id, amount, method ?? null, reference_no ?? null, note ?? null, req.user.id]
    );

    await recalcPaymentStatus(booking_id);

    res.status(201).json({ message: "Payment added" });
  })
);

// Soft delete payment
router.delete(
  "/:id",
  requireAuth,
  requireRole(1, 2),
  asyncHandler(async (req, res) => {
    const [[pay]] = await pool.query(
      `SELECT id, booking_id FROM payments WHERE id=? LIMIT 1`,
      [req.params.id]
    );
    if (!pay) return res.status(404).json({ message: "Payment not found" });

    await pool.query(`UPDATE payments SET is_active=FALSE WHERE id=?`, [req.params.id]);
    await recalcPaymentStatus(pay.booking_id);

    res.json({ message: "Payment deleted (soft)" });
  })
);

module.exports = router;

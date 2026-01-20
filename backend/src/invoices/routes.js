const express = require("express");
const { z } = require("zod");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");

const router = express.Router();

const createInvoiceSchema = z.object({
  booking_id: z.number().int().positive(),
  invoice_no: z.string().max(50).optional().nullable(),
  file_path: z.string().min(3).max(500),
});

// Store invoice file path (image path)
router.post(
  "/",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const { booking_id, invoice_no, file_path } = parsed.data;

    const [[bk]] = await pool.query(
      `SELECT id FROM bookings WHERE id=? AND is_active=TRUE LIMIT 1`,
      [booking_id]
    );
    if (!bk) return res.status(404).json({ message: "Booking not found" });

    await pool.query(
      `INSERT INTO invoices (booking_id, invoice_no, file_path, created_by)
       VALUES (?, ?, ?, ?)`,
      [booking_id, invoice_no ?? null, file_path, req.user.id]
    );

    res.status(201).json({ message: "Invoice stored" });
  })
);

module.exports = router;

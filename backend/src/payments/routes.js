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
  paid_at: z.string().optional().nullable(),
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

    const { booking_id, amount, method, reference_no, note,paid_at } = parsed.data;

    console.log(paid_at);

    const paidAtValue = paid_at ? new Date(paid_at) : new Date();

    console.log(paidAtValue);

    // Ensure booking exists & active
    const [[bk]] = await pool.query(
      `SELECT id FROM bookings WHERE id=? AND is_active=TRUE LIMIT 1`,
      [booking_id]
    );
    if (!bk) return res.status(404).json({ message: "Booking not found" });

    await pool.query(
      `INSERT INTO payments
       (booking_id, amount, method, reference_no, note, paid_at, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [booking_id, amount, method ?? null, reference_no ?? null, note ?? null,paidAtValue, req.user.id]
    );

    await recalcPaymentStatus(booking_id);

    res.status(201).json({ message: "Payment added" });
  })
);


// GET payments (admin/super only)
// Examples:
//  GET /api/payments
//  GET /api/payments?booking_id=1
//  GET /api/payments?include_inactive=true
router.get(
  "/",
  requireAuth,
  requireRole(1, 2),
  asyncHandler(async (req, res) => {
    const bookingId = req.query.booking_id ? Number(req.query.booking_id) : null;
    const includeInactive = String(req.query.include_inactive || "false") === "true";

    if (req.query.booking_id && Number.isNaN(bookingId)) {
      return res.status(400).json({ message: "booking_id must be a number" });
    }

    let sql = `
      SELECT
        p.id, p.booking_id, p.amount, p.method, p.reference_no, p.paid_at, p.note,
        p.is_active, p.created_by,
        b.service_name, b.service_amount, b.payment_status
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (!includeInactive) {
      sql += ` AND p.is_active = TRUE`;
    }

    if (bookingId) {
      sql += ` AND p.booking_id = ?`;
      params.push(bookingId);
    }

    sql += ` ORDER BY p.paid_at DESC, p.id DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
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


// Add this optimized endpoint to your bookings routes file
// This reduces API calls by joining all necessary data in one query

// Add this to your payments routes file (payments.js)

// GET /api/payments/overview
// Returns all payment transactions with customer and booking info
// GET /api/payments/overview
// Returns all payment transactions with customer and booking info
router.get(
  "/overview",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const { page = 1, startDate, endDate, method } = req.query;
    const perPage = 50;
    const offset = (page - 1) * perPage;

    let whereClause = 'WHERE p.is_active = TRUE';
    const params = [];

    // Apply date range filter (filter by payment date, not booking date)
    if (startDate && endDate) {
      // Filter for date range (inclusive of both dates)
      whereClause += ` AND DATE(p.paid_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      // Only start date provided
      whereClause += ` AND DATE(p.paid_at) >= ?`;
      params.push(startDate);
    } else if (endDate) {
      // Only end date provided
      whereClause += ` AND DATE(p.paid_at) <= ?`;
      params.push(endDate);
    }

    // Apply payment method filter
    if (method && method !== 'all') {
      whereClause += ` AND p.method = ?`;
      params.push(method);
    }

    // Main query - get all payments with customer and booking info
    const [payments] = await pool.query(
      `SELECT 
        p.id,
        p.booking_id,
        p.amount,
        p.method,
        p.reference_no,
        p.paid_at,
        p.note,
        p.is_active,
        p.created_by,
        b.service_name,
        b.service_amount,
        b.payment_status,
        b.booking_date,
        u.name as customer_name,
        u.phone_no as customer_phone
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       JOIN users u ON u.id = b.customer_id
       ${whereClause}
       ORDER BY p.paid_at DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    // Get total count for pagination
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       ${whereClause}`,
      params
    );

    // Calculate statistics for filtered data
    const [[stats]] = await pool.query(
      `SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_amount
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       ${whereClause}`,
      params
    );

    // Calculate today's payments (regardless of filters)
    const today = new Date().toISOString().split('T')[0];
    const [[todayStats]] = await pool.query(
      `SELECT 
        COUNT(*) as today_payments,
        COALESCE(SUM(p.amount), 0) as today_amount
       FROM payments p
       WHERE p.is_active = TRUE
         AND DATE(p.paid_at) = ?`,
      [today]
    );

    const statistics = {
      totalPayments: parseInt(stats?.total_payments || 0),
      totalAmount: parseFloat(stats?.total_amount || 0),
      todayPayments: parseInt(todayStats?.today_payments || 0),
      todayAmount: parseFloat(todayStats?.today_amount || 0),
    };

    res.json({
      payments,
      statistics,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        totalPages: Math.ceil(total / perPage),
        perPage,
      },
    });
  })
);
module.exports = router;

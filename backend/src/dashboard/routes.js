const express = require("express");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Returns comprehensive dashboard statistics in a single optimized query
 * - Today's bookings with customer details
 * - Upcoming bookings with customer details
 * - Revenue statistics
 * - Pending payments
 * - Customer count
 */
router.get(
  "/stats",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Single optimized query for today's bookings with customer info
      const [todayBookings] = await pool.query(
        `SELECT 
          b.id,
          DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
          b.start_time,
          b.end_time,
          b.customer_id,
          b.service_name,
          b.service_amount,
          b.note,
          b.status,
          b.payment_status,
          b.created_at,
          u.name as customer_name,
          u.phone_no as customer_phone,
          u.email as customer_email,
          COALESCE(SUM(p.amount), 0) as paid_amount
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         LEFT JOIN payments p ON p.booking_id = b.id AND p.is_active = TRUE
         WHERE DATE(b.booking_date) = ?
           AND b.is_active = TRUE
         GROUP BY b.id, u.id
         ORDER BY b.start_time ASC`,
        [today]
      );

      // Single optimized query for upcoming bookings with customer info
      const [upcomingBookings] = await pool.query(
        `SELECT 
          b.id,
          DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
          b.start_time,
          b.end_time,
          b.customer_id,
          b.service_name,
          b.service_amount,
          b.note,
          b.status,
          b.payment_status,
          b.created_at,
          u.name as customer_name,
          u.phone_no as customer_phone,
          u.email as customer_email,
          COALESCE(SUM(p.amount), 0) as paid_amount
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         LEFT JOIN payments p ON p.booking_id = b.id AND p.is_active = TRUE
         WHERE DATE(b.booking_date) > ?
           AND b.is_active = TRUE
         GROUP BY b.id, u.id
         ORDER BY b.booking_date ASC, b.start_time ASC
         LIMIT 10`,
        [today]
      );

      // Single query for all financial statistics
      const [[financialStats]] = await pool.query(
        `SELECT 
          SUM(CASE WHEN b.status = 'completed' THEN b.service_amount ELSE 0 END) as total_revenue,
          SUM(b.service_amount) - COALESCE(SUM(p.amount), 0) as pending_payments,
          COUNT(DISTINCT CASE WHEN (b.service_amount - COALESCE(bp.total_paid, 0)) > 0 THEN b.id END) as bookings_with_pending
         FROM bookings b
         LEFT JOIN payments p ON p.booking_id = b.id AND p.is_active = TRUE
         LEFT JOIN (
           SELECT booking_id, SUM(amount) as total_paid
           FROM payments
           WHERE is_active = TRUE
           GROUP BY booking_id
         ) bp ON bp.booking_id = b.id
         WHERE b.is_active = TRUE`
      );

      // Get total customer count
      const [[customerCount]] = await pool.query(
        `SELECT COUNT(*) as total_customers
         FROM users
         WHERE role = 4 AND is_active = 1`
      );

      // Get staff assignments for today's bookings in one query
      const todayBookingIds = todayBookings.map(b => b.id);
      let todayStaffAssignments = [];
      
      if (todayBookingIds.length > 0) {
        const [staff] = await pool.query(
          `SELECT 
            bs.booking_id,
            u.id as staff_id,
            u.name as staff_name
           FROM booking_staff bs
           JOIN users u ON u.id = bs.staff_id
           WHERE bs.booking_id IN (?) AND u.is_active = 1`,
          [todayBookingIds]
        );
        todayStaffAssignments = staff;
      }

      // Attach staff to today's bookings
      const todayBookingsWithStaff = todayBookings.map(booking => ({
        ...booking,
        service_amount: parseFloat(booking.service_amount),
        paid_amount: parseFloat(booking.paid_amount),
        balance: parseFloat(booking.service_amount) - parseFloat(booking.paid_amount),
        customer: {
          id: booking.customer_id,
          name: booking.customer_name,
          phone_no: booking.customer_phone,
          email: booking.customer_email
        },
        staff: todayStaffAssignments
          .filter(s => s.booking_id === booking.id)
          .map(s => ({
            id: s.staff_id,
            name: s.staff_name
          }))
      }));

      // Format upcoming bookings
      const upcomingBookingsFormatted = upcomingBookings.map(booking => ({
        ...booking,
        service_amount: parseFloat(booking.service_amount),
        paid_amount: parseFloat(booking.paid_amount),
        balance: parseFloat(booking.service_amount) - parseFloat(booking.paid_amount),
        customer: {
          id: booking.customer_id,
          name: booking.customer_name,
          phone_no: booking.customer_phone,
          email: booking.customer_email
        }
      }));

      // Calculate today's statistics
      const todayCompleted = todayBookings.filter(b => b.status.toLowerCase() === 'completed').length;
      const todayRevenue = todayBookings
        .filter(b => b.status.toLowerCase() === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.service_amount), 0);

      res.json({
        today: {
          bookings: todayBookingsWithStaff,
          total: todayBookings.length,
          completed: todayCompleted,
          revenue: todayRevenue
        },
        upcoming: {
          bookings: upcomingBookingsFormatted,
          total: upcomingBookingsFormatted.length
        },
        financial: {
          totalRevenue: parseFloat(financialStats.total_revenue) || 0,
          pendingPayments: parseFloat(financialStats.pending_payments) || 0,
          bookingsWithPending: financialStats.bookings_with_pending || 0
        },
        customers: {
          total: customerCount.total_customers || 0
        }
      });

    } catch (err) {
      console.error('❌ Dashboard stats error:', err);
      res.status(500).json({ 
        message: "Failed to fetch dashboard statistics",
        error: err.message 
      });
    }
  })
);

/**
 * GET /api/dashboard/recent-activity
 * Returns recent bookings and payments for activity feed
 */
router.get(
  "/recent-activity",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    try {
      // Get recent bookings
      const [recentBookings] = await pool.query(
        `SELECT 
          b.id,
          DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
          b.start_time,
          b.service_name,
          b.status,
          u.name as customer_name,
          b.created_at
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         WHERE b.is_active = TRUE
         ORDER BY b.created_at DESC
         LIMIT ?`,
        [limit]
      );

      // Get recent payments
      const [recentPayments] = await pool.query(
        `SELECT 
          p.id,
          p.amount,
          p.method,
          p.paid_at,
          u.name as customer_name,
          b.service_name
         FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         JOIN users u ON b.customer_id = u.id
         WHERE p.is_active = TRUE
         ORDER BY p.paid_at DESC
         LIMIT ?`,
        [limit]
      );

      res.json({
        bookings: recentBookings.map(b => ({
          ...b,
          type: 'booking'
        })),
        payments: recentPayments.map(p => ({
          ...p,
          amount: parseFloat(p.amount),
          type: 'payment'
        }))
      });

    } catch (err) {
      console.error('❌ Recent activity error:', err);
      res.status(500).json({ 
        message: "Failed to fetch recent activity",
        error: err.message 
      });
    }
  })
);

/**
 * GET /api/dashboard/weekly-summary
 * Returns booking and revenue statistics for the current week
 */
router.get(
  "/weekly-summary",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    try {
      const [weeklyStats] = await pool.query(
        `SELECT 
          DATE_FORMAT(b.booking_date, '%Y-%m-%d') as date,
          COUNT(*) as bookings_count,
          SUM(CASE WHEN b.status = 'completed' THEN b.service_amount ELSE 0 END) as revenue,
          COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_count
         FROM bookings b
         WHERE b.booking_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
           AND b.booking_date <= CURDATE()
           AND b.is_active = TRUE
         GROUP BY DATE(b.booking_date)
         ORDER BY b.booking_date ASC`
      );

      res.json({
        daily: weeklyStats.map(day => ({
          date: day.date,
          bookings: day.bookings_count,
          revenue: parseFloat(day.revenue) || 0,
          completed: day.completed_count
        }))
      });

    } catch (err) {
      console.error('❌ Weekly summary error:', err);
      res.status(500).json({ 
        message: "Failed to fetch weekly summary",
        error: err.message 
      });
    }
  })
);

module.exports = router;
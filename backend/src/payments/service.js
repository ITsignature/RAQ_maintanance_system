const pool = require("../db");

async function recalcPaymentStatus(bookingId) {
  const [[booking]] = await pool.query(
    `SELECT service_amount FROM bookings WHERE id=? AND is_active=TRUE LIMIT 1`,
    [bookingId]
  );
  if (!booking) return;

  const [[sumRow]] = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total_paid
     FROM payments
     WHERE booking_id=? AND is_active=TRUE`,
    [bookingId]
  );

  const totalPaid = Number(sumRow.total_paid);
  const serviceAmount = Number(booking.service_amount);

  let payment_status = "unpaid";
  if (totalPaid > 0 && totalPaid < serviceAmount) payment_status = "partial";
  if (serviceAmount === 0 || totalPaid >= serviceAmount) payment_status = "paid";

  await pool.query(`UPDATE bookings SET payment_status=? WHERE id=?`, [payment_status, bookingId]);
}

module.exports = { recalcPaymentStatus };

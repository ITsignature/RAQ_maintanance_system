const pool = require("../db");

async function createBookingWithStaff({ booking, staff_ids, created_by }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO bookings
      (booking_date, start_time, end_time, customer_id, service_name, service_amount, note,
       status, payment_status, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', TRUE, ?)`,
      [
        booking.booking_date,
        booking.start_time,
        booking.end_time,
        booking.customer_id,
        booking.service_name,
        booking.service_amount,
        booking.note ?? null,
        created_by,
      ]
    );

    const bookingId = result.insertId;

    if (staff_ids?.length) {
      const values = staff_ids.map((sid) => [bookingId, sid, created_by]);
      await conn.query(
        `INSERT INTO booking_staff (booking_id, staff_id, assigned_by)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return bookingId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createBookingWithStaff };

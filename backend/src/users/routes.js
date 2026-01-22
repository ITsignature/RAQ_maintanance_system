const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../auth/middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  phone_no: z.string().min(7).max(20),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).max(100),
  role: z.number().int().refine((r) => [2, 3].includes(r), "role must be 2 (admin) or 3 (staff)"),
});

const createCustomerSchema = z.object({
  name:           z.string().min(2).max(120),
  phone_no:       z.string().min(9).max(20),     // e.g. 0777123456 or +94777123456
  telephone:      z.string().min(9).max(20).optional().nullable(),
  email:          z.string().email().max(100).optional().nullable(),
  loyalty_number: z.string().max(50).optional().nullable(),
  address:        z.string().max(500).optional().nullable(),
});

// List admins + staff
router.get("/", requireAuth, requireRole(1, 2), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, phone_no, email, role, is_active, created_at
     FROM users
     WHERE role IN (2,3)
     ORDER BY id DESC`
  );
  res.json(rows);
});

// Create admin/staff
router.post("/", requireAuth, requireRole(1, 2), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  const { name, phone_no, email, password, role } = parsed.data;

  try {
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (role, name, phone_no, email, password_hash, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [role, name, phone_no, email ?? null, password_hash, req.user.id]
    );

    res.status(201).json({ message: "User created" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Duplicate phone/email already exists" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Deactivate STAFF only (role 3)
router.patch("/:id/deactivate", requireAuth, requireRole(1, 2), async (req, res) => {
  const userId = Number(req.params.id);

  const [[u]] = await pool.query(`SELECT id, role FROM users WHERE id=? LIMIT 1`, [userId]);
  if (!u) return res.status(404).json({ message: "User not found" });

  if (u.role !== 3) {
    return res.status(403).json({ message: "Only staff accounts can be deactivated" });
  }

  await pool.query(`UPDATE users SET is_active=0 WHERE id=?`, [userId]);
  res.json({ message: "User deactivated" });
});

// Reactivate STAFF only (role 3)
router.patch("/:id/activate", requireAuth, requireRole(1, 2), async (req, res) => {
  const userId = Number(req.params.id);

  const [[u]] = await pool.query(`SELECT id, role FROM users WHERE id=? LIMIT 1`, [userId]);
  if (!u) return res.status(404).json({ message: "User not found" });

  if (u.role !== 3) {
    return res.status(403).json({ message: "Only staff accounts can be activated" });
  }

  await pool.query(`UPDATE users SET is_active=1 WHERE id=?`, [userId]);
  res.json({ message: "User activated" });
});



// GET /api/users/staff  -> role 3
router.get("/staff", requireAuth, requireRole(1, 2, 3), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, phone_no
     FROM users
     WHERE role=3 AND is_active=1
     ORDER BY name`
  );
  res.json(rows);
});


// GET /api/users/customers/stats - Stats for ALL customers
router.get("/customers/stats", requireAuth, requireRole(1, 2, 3), async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        b.customer_id,
        SUM(b.service_amount) as total_amount,
        COALESCE(SUM(p.amount), 0) as paid_amount,
        (SUM(b.service_amount) - COALESCE(SUM(p.amount), 0)) as outstanding_balance
       FROM bookings b
       LEFT JOIN payments p ON p.booking_id = b.id AND p.is_active = TRUE
       WHERE b.is_active = TRUE
       GROUP BY b.customer_id`
    );

    // Convert to a map for easy lookup
    const statsMap = {};
    stats.forEach(s => {
      statsMap[s.customer_id] = {
        total_amount: parseFloat(s.total_amount) || 0,
        paid_amount: parseFloat(s.paid_amount) || 0,
        outstanding_balance: parseFloat(s.outstanding_balance) || 0
      };
    });

    res.json(statsMap);
  } catch (err) {
    console.error('❌ Error fetching customer stats:', err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
});


// GET /api/users/customers?search=0757 OR name
router.get("/customers", requireAuth, requireRole(1, 2, 3), async (req, res) => {
  const search = String(req.query.search || "").trim();

  // ─── Removed or commented out ───
  // if (search.length < 1) return res.json([]);

  const like = search.length > 0 ? `%${search}%` : '%';  // % matches everything

  const [rows] = await pool.query(
    `SELECT id, name, phone_no, email, loyalty_number
     FROM users
     WHERE role=4 AND is_active=1
       AND (name LIKE ? OR phone_no LIKE ?)
     ORDER BY name
     LIMIT 100`,           // ← increase limit or add pagination
    [like, like]
  );

  res.json(rows);
});

//GET customer by Id
router.get("/:id", requireAuth, requireRole(1, 2, 3), async (req, res) => {
  const userId = Number(req.params.id);
  const [[user]] = await pool.query(`SELECT id, name, phone_no, email, loyalty_number,address FROM users WHERE id=? LIMIT 1`, [userId]);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});



// ────────────────────────────────────────────────
//           POST /api/users/customers
//           → Creates customer (role = 4)
// ────────────────────────────────────────────────


router.post(
  "/customers",
  requireAuth,
  requireRole(1, 2, 3),           // admin, manager, staff can create customers
  async (req, res) => {
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message
        }))
      });
    }

    const {
      name,
      phone_no,
      telephone,
      email,
      loyalty_number,
      address
    } = parsed.data;

    try {
      const [result] = await pool.query(
        `INSERT INTO users (
           role,
           name,
           phone_no,
           telephone,
           email,
           loyalty_number,
           address,
           is_active,
           created_by,
           created_at
         ) VALUES (4, ?, ?, ?, ?, ?, ?, 1, ?, NOW())`,
        [
          name,
          phone_no,
          telephone ?? null,
          email ?? null,
          loyalty_number ?? null,
          address ?? null,
          req.user.id
        ]
      );

      const newCustomerId = result.insertId;

      res.status(201).json({
        message: "Customer created",
        customer_id: newCustomerId
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Phone number or email already exists"
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to create customer" });
    }
  }
);


// GET /api/users/customers/:id/details
// Returns customer info + booking history + payment stats
// Replace your /customers/:id/details route with this fixed version

router.get("/customers/:id/details", requireAuth, requireRole(1, 2, 3), async (req, res) => {
  const customerId = Number(req.params.id);

  try {
    // 1. Get customer info
    const [[customer]] = await pool.query(
      `SELECT id, name, phone_no, telephone, email, loyalty_number, address, created_at
       FROM users
       WHERE id = ? AND role = 4 AND is_active = 1
       LIMIT 1`,
      [customerId]
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // 2. Get all bookings for this customer
    const [bookings] = await pool.query(
      `SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.service_name,
        b.service_amount,
        b.status,
        b.payment_status,
        b.note,
        b.created_at,
        COALESCE(SUM(p.amount), 0) as paid_amount
       FROM bookings b
       LEFT JOIN payments p ON p.booking_id = b.id AND p.is_active = TRUE
       WHERE b.customer_id = ? AND b.is_active = TRUE
       GROUP BY b.id
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [customerId]
    );

    // 3. Get staff assignments for each booking
    const bookingIds = bookings.map(b => b.id);
    let staffAssignments = [];
    
    if (bookingIds.length > 0) {
      const [staff] = await pool.query(
        `SELECT 
          bs.booking_id,
          u.id,
          u.name,
          u.phone_no
         FROM booking_staff bs
         JOIN users u ON u.id = bs.staff_id
         WHERE bs.booking_id IN (?) AND u.is_active = 1`,
        [bookingIds]
      );
      staffAssignments = staff;
    }

    // 4. Attach staff to each booking
    const bookingsWithStaff = bookings.map(booking => ({
      ...booking,
      staff: staffAssignments.filter(s => s.booking_id === booking.id).map(s => ({
        id: s.id,
        name: s.name,
        phone_no: s.phone_no
      }))
    }));

    // 5. Calculate statistics - FIXED VERSION
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;
    
    // ✅ FIX: Properly sum all bookings with explicit 0 initial value
    const totalSpent = bookings.reduce((sum, b) => {
      return sum + parseFloat(b.service_amount);
    }, 0); // ← This 0 is CRITICAL!
    
    const totalPaid = bookings.reduce((sum, b) => {
      return sum + parseFloat(b.paid_amount);
    }, 0); // ← This 0 is CRITICAL!
    
    const outstandingBalance = totalSpent - totalPaid;

    // Debug logging
    console.log('📊 Customer Statistics Debug:');
    console.log('  Customer ID:', customerId);
    console.log('  Total Bookings:', totalBookings);
    console.log('  Bookings amounts:', bookings.map(b => parseFloat(b.service_amount)));
    console.log('  Total Spent:', totalSpent);
    console.log('  Total Paid:', totalPaid);
    console.log('  Outstanding:', outstandingBalance);

    // 6. Get recent payments
    const [payments] = await pool.query(
      `SELECT 
        p.id,
        p.booking_id,
        p.amount,
        p.method,
        p.reference_no,
        p.paid_at,
        b.service_name
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE b.customer_id = ? AND p.is_active = TRUE
       ORDER BY p.paid_at DESC
       LIMIT 20`,
      [customerId]
    );

    // 7. Return complete customer details
    res.json({
      customer,
      bookings: bookingsWithStaff,
      payments,
      statistics: {
        totalBookings,
        completedBookings,
        totalSpent,
        totalPaid,
        outstandingBalance
      }
    });

  } catch (err) {
    console.error('Error fetching customer details:', err);
    res.status(500).json({ message: "Server error" });
  }
});


// Soft-delete customer (role = 4 only)
// DELETE /api/users/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole(1, 2), // Only admin (1) or manager (2) can delete customers
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // 1. Prevent deleting your own account
    if (userId === req.user.id) {
      return res.status(403).json({ message: "Cannot delete your own account" });
    }

    // 2. Check if this is actually a customer (role = 4)
    const [[user]] = await pool.query(
      "SELECT role FROM users WHERE id = ? AND is_active = 1",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    if (user.role !== 4) {
      return res.status(403).json({ message: "This endpoint can only delete customers (role 4)" });
    }

    // 3. Prevent deletion if customer has active bookings
    const [[{ cnt }]] = await pool.query(
      `SELECT COUNT(*) as cnt 
       FROM bookings 
       WHERE customer_id = ? 
         AND is_active = TRUE`,
      [userId]
    );

    if (cnt > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with active bookings. Please cancel or complete all bookings first.",
        active_bookings_count: cnt,
      });
    }

    // 4. Soft delete (set is_active = 0)
    const [result] = await pool.query(
      `UPDATE users 
       SET is_active = 0, 
           updated_at = NOW(),
           updated_by = ?
       WHERE id = ? AND role = 4 AND is_active = 1`,
      [req.user.id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found or already deleted" });
    }

    // Optional: clean up any related data (e.g. cancel pending bookings if needed)
    // await pool.query("UPDATE bookings SET status = 'Cancelled' WHERE customer_id = ? AND status = 'Scheduled'", [userId]);

    res.json({
      message: "Customer successfully deleted (soft delete)",
      customer_id: userId,
    });
  })
);


// Fixed version with better debugging and error handling


// Add this route to your users router (after POST /customers)

const updateCustomerSchema = z.object({
  name: z.string().min(2).max(120),
  phone_no: z.string().min(9).max(20),
  telephone: z.string().min(9).max(20).optional().nullable(),
  email: z.string().email().max(100).optional().nullable(),
  loyalty_number: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

// PUT /api/users/customers/:id
// Update customer information
router.put(
  "/customers/:id",
  requireAuth,
  requireRole(1, 2, 3),
  asyncHandler(async (req, res) => {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Validate input
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message
        }))
      });
    }

    const {
      name,
      phone_no,
      telephone,
      email,
      loyalty_number,
      address
    } = parsed.data;

    try {
      // Check if customer exists and is a customer (role = 4)
      const [[customer]] = await pool.query(
        `SELECT id, role FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
        [customerId]
      );

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      if (customer.role !== 4) {
        return res.status(403).json({ message: "This endpoint can only update customers" });
      }

      // Update customer
      const [result] = await pool.query(
        `UPDATE users 
         SET name = ?,
             phone_no = ?,
             telephone = ?,
             email = ?,
             loyalty_number = ?,
             address = ?,
             updated_at = NOW(),
             updated_by = ?
         WHERE id = ? AND role = 4 AND is_active = 1`,
        [
          name,
          phone_no,
          telephone ?? null,
          email ?? null,
          loyalty_number ?? null,
          address ?? null,
          req.user.id,
          customerId
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Customer not found or already deleted" });
      }

      res.json({
        message: "Customer updated successfully",
        customer_id: customerId
      });

    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Phone number or email already exists"
        });
      }
      console.error('Error updating customer:', err);
      res.status(500).json({ message: "Failed to update customer" });
    }
  })
);


module.exports = router;

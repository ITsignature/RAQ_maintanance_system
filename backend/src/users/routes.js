const express = require("express");
const pool = require("../db");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../auth/middleware");

const router = express.Router();

const createCustomerSchema = z.object({
  name: z.string().min(2, "name is required").max(120),
  phone_no: z.string().min(7).max(20), // you can refine pattern for Sri Lanka if you want
  telephone: z.string().min(7).max(20).optional().nullable(),
  email: z.string().email("invalid email").optional().nullable(),
  loyalty_number: z.string().min(2).max(50).optional().nullable(),
  address: z.string().min(2).optional().nullable(),
});

router.post("/", requireAuth, requireRole(1, 2), async (req, res) => {
  // 1) validate body
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const { name, phone_no, telephone, email, loyalty_number, address } = parsed.data;

  try {
    // 2) insert customer (role=3), created_by from logged-in admin
    await pool.query(
      `INSERT INTO users
       (role, name, phone_no, telephone, email, loyalty_number, address, created_by)
       VALUES (3, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone_no,
        telephone ?? null,
        email ?? null,
        loyalty_number ?? null,
        address ?? null,
        req.user.id,
      ]
    );

    return res.status(201).json({ message: "Customer created" });
  } catch (err) {
    // 3) handle duplicate key errors nicely
    if (err.code === "ER_DUP_ENTRY") {
      // message contains which UNIQUE field failed, but we keep response simple
      return res.status(409).json({ message: "Duplicate value (phone/email/loyalty) already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

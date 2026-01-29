const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");

const router = express.Router();

// ================= MULTER CONFIG =================
const uploadDir = "./uploads/booking-images";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only images (jpeg, png, webp) allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// ================= ROUTES =================

// Upload image for a booking
router.post(
  "/upload",
  requireAuth,
  requireRole(1, 2, 3),
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { booking_id } = req.body;
    if (!booking_id) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "booking_id is required" });
    }

    const filePath = `/uploads/booking-images/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO booking_images (booking_id, file_path, created_by)
       VALUES (?, ?, ?)`,
      [booking_id, filePath, req.user.id]
    );

    res.status(201).json({
      message: "Image uploaded",
      image_id: result.insertId,
      path: filePath,
    });
  })
);

// Get images by booking
router.get(
  "/booking/:booking_id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT id, file_path, uploaded_at
       FROM booking_images
       WHERE booking_id=? AND is_active=1
       ORDER BY uploaded_at DESC`,
      [req.params.booking_id]
    );

    res.json(rows);
  })
);

// Delete image (soft delete)
router.delete(
  "/:id",
  requireAuth,
  requireRole(1, 2),
  asyncHandler(async (req, res) => {
    const [[img]] = await pool.query(
      `SELECT file_path FROM booking_images WHERE id=? LIMIT 1`,
      [req.params.id]
    );
    if (!img) return res.status(404).json({ message: "Image not found" });

    await pool.query(`UPDATE booking_images SET is_active=0 WHERE id=?`, [req.params.id]);

    // optional: remove file
    const filePath = path.join(__dirname, "../..", img.file_path);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }

    res.json({ message: "Image deleted" });
  })
);

module.exports = router;

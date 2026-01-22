const express = require("express");
const { z } = require("zod");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../auth/middleware");


const router = express.Router();

// ============================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// ============================================

// Create uploads directory if it doesn't exist
const uploadDir = './uploads/invoices';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed!'));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createInvoiceSchema = z.object({
  booking_id: z.number().int().positive(),
  invoice_no: z.string().max(50).optional().nullable(),
  file_path: z.string().min(3).max(500),
});

// ============================================
// ROUTES
// ============================================

// Upload invoice with actual file (RECOMMENDED) - MUST BE FIRST
router.post(
  "/upload",
  requireAuth,
  requireRole(1, 2, 3),
  upload.single('invoice'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { booking_id, invoice_no } = req.body;

    if (!booking_id) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'booking_id is required' });
    }

    // Check if booking exists
    const [[bk]] = await pool.query(
      `SELECT id FROM bookings WHERE id=? AND is_active=TRUE LIMIT 1`,
      [booking_id]
    );

    if (!bk) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Booking not found' });
    }

    const filePath = `/uploads/invoices/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO invoices (booking_id, invoice_no, file_path, created_by)
       VALUES (?, ?, ?, ?)`,
      [booking_id, invoice_no || null, filePath, req.user.id]
    );

    res.status(201).json({
      message: 'Invoice uploaded successfully',
      invoice_id: result.insertId,
      file: {
        filename: req.file.filename,
        path: filePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  })
);

// Store invoice file path (for base64 or external URLs)
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

    const [result] = await pool.query(
      `INSERT INTO invoices (booking_id, invoice_no, file_path, created_by)
       VALUES (?, ?, ?, ?)`,
      [booking_id, invoice_no ?? null, file_path, req.user.id]
    );

    res.status(201).json({ 
      message: "Invoice stored",
      invoice_id: result.insertId
    });
  })
);

// Get invoices for a booking
router.get(
  "/booking/:booking_id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [invoices] = await pool.query(
      `SELECT 
        i.id,
        i.booking_id,
        i.invoice_no,
        i.file_path,
        i.issued_at,
        i.created_by,
        u.name as created_by_name
       FROM invoices i
       LEFT JOIN users u ON u.id = i.created_by
       WHERE i.booking_id = ? AND i.is_active = TRUE
       ORDER BY i.issued_at DESC`,
      [req.params.booking_id]
    );

    res.json(invoices);
  })
);

// Example of download route
router.get(
  "/:id/download",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [[invoice]] = await pool.query(
      `SELECT file_path FROM invoices WHERE id=? LIMIT 1`,
      [req.params.id]
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // File path stored as '/uploads/invoices/filename.png' in the database
    // Adjusting the path to be relative to the root directory
    const filePath = path.join(__dirname, '../..', invoice.file_path); // Move up two directories to the root

    console.log('Attempting to download file from:', filePath);  // Debugging log

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Serve the file
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).json({ message: 'Error downloading file' });
      }
    });
  })
);




// Get single invoice
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [[invoice]] = await pool.query(
      `SELECT 
        i.*,
        u.name as created_by_name
       FROM invoices i
       LEFT JOIN users u ON u.id = i.created_by
       WHERE i.id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  })
);




// Delete invoice (soft delete by setting is_active to 0)
router.delete(
  "/:id",
  requireAuth,
  requireRole(1, 2),
  asyncHandler(async (req, res) => {
    const [[invoice]] = await pool.query(
      `SELECT id, file_path FROM invoices WHERE id=? LIMIT 1`,
      [req.params.id]
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Soft delete the invoice by setting is_active = 0
    await pool.query(
      `UPDATE invoices SET is_active = 0 WHERE id = ?`,
      [req.params.id]
    );

    // Optionally delete the file associated with the invoice if necessary
    if (invoice.file_path.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', invoice.file_path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    res.json({ message: 'Invoice deleted successfully (soft delete)' });
  })
);

module.exports = router;
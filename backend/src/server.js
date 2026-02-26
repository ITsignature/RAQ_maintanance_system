require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require('path');  // Import path module at the top

const app = express();
//author
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// ============================================
// SECURITY & MIDDLEWARE
// ============================================
app.use(helmet());
app.set("trust proxy", 1);

// ⭐ IMPORTANT: Increase payload size limits for file uploads
// Default is 100kb - increase to 50mb for invoice/image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

// ============================================
// CORS CONFIGURATION
// ============================================
// If frontend is separate domain, enable CORS with credentials:
app.use(
  cors({
     origin: [
        "https://maintenance.royalaquarium.lk",
        "https://www.maintenance.royalaquarium.lk",
        "http://localhost:5173"
      ],
    credentials: true,
  })
);

// ============================================
// RATE LIMITING
// ============================================
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 500,
  })
);

// ============================================
// ROUTES
// ============================================
const authRoutes = require("./auth/routes");
const usersRoutes = require("./users/routes");
const bookingsRoutes = require("./bookings/routes");
const paymentsRoutes = require("./payments/routes");
const invoicesRoutes = require("./invoices/routes");
const smsRoutes = require("./sms/routes");
const { requireAuth, requireRole } = require("./auth/middleware");
const dashboardRoutes = require("./dashboard/routes");
const imageRoutes = require("./images/routes");

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/images', imageRoutes);
// Protected routes examples
app.get("/api/admin/only", requireAuth, requireRole(1, 2), (req, res) => {
  res.json({ message: "Hello staff!", user: req.user });
});

app.get("/api/super/only", requireAuth, requireRole(1), (req, res) => {
  res.json({ message: "Hello super admin!", user: req.user });
});

// ============================================
// ERROR HANDLING
// ============================================
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  // Handle payload too large error
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'File too large. Maximum size is 50MB.',
      error: 'PAYLOAD_TOO_LARGE'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// START SERVER
// ============================================
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 API running on port :${port}`);
  console.log(`📦 Max payload size: 50mb`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

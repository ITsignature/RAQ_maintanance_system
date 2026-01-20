require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./auth/routes");
const usersRoutes = require("./users/routes");
const bookingsRoutes = require("./bookings/routes");
const paymentsRoutes = require("./payments/routes");
const invoicesRoutes = require("./invoices/routes");
const { requireAuth, requireRole } = require("./auth/middleware");





// If frontend is separate domain, enable CORS with credentials:
app.use(
  cors({
    origin: ["http://localhost:3000"], // change to your frontend
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users",usersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/invoices", invoicesRoutes);

// protected routes:
app.get("/api/admin/only", requireAuth, requireRole(1, 2), (req, res) => {
  res.json({ message: "Hello staff!", user: req.user });
});

app.get("/api/super/only", requireAuth, requireRole(1), (req, res) => {
  res.json({ message: "Hello super admin!", user: req.user });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on :${port}`));

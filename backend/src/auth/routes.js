const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { signAccessToken, signRefreshToken, hashToken } = require("./token");
const { requireAuth, requireRole } = require("./middleware");

const router = express.Router();

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/auth/refresh",
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
}

router.post("/login", async (req, res) => {
  const { phone_no, password } = req.body;

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE phone_no=? AND is_active=1 LIMIT 1",
    [phone_no]
  );

  const user = rows[0];
  if (!user || !user.password_hash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  // Only staff allowed
  if (![1, 2].includes(user.role)) {
    return res.status(403).json({ message: "Customers cannot log in" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // store refresh token
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip)
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, tokenHash, expiresAt, req.get("user-agent"), req.ip]
  );

  res
    .cookie("refresh_token", refreshToken, cookieOptions())
    .json({
      accessToken,
      user: { id: user.id, name: user.name, role: user.role },
    });
});



router.post("/refresh", async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: "Missing refresh token" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid/expired refresh token" });
  }

  const tokenHash = hashToken(token);

  // Check token exists and not revoked and not expired
  const [rows] = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash=? AND revoked_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  const record = rows[0];
  if (!record) return res.status(401).json({ message: "Refresh token revoked" });

  // Load user
  const [urows] = await pool.query(
    "SELECT id, name, role_id, phone_no, is_active FROM users WHERE id=? LIMIT 1",
    [payload.sub]
  );
  const user = urows[0];
  if (!user || !user.is_active) return res.status(401).json({ message: "User inactive" });

  // rotate refresh token: revoke old and create new
  await pool.query("UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=?", [record.id]);

  const newRefresh = signRefreshToken(user);
  const newHash = hashToken(newRefresh);

  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip)
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, newHash, expiresAt, req.get("user-agent"), req.ip]
  );

  const accessToken = signAccessToken(user);

  res
    .cookie("refresh_token", newRefresh, cookieOptions())
    .json({ accessToken });
});


router.post("/logout", async (req, res) => {
  const token = req.cookies.refresh_token;
  if (token) {
    const tokenHash = hashToken(token);
    await pool.query(
      "UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=?",
      [tokenHash]
    );
  }
  res.clearCookie("refresh_token", cookieOptions());
  res.json({ message: "Logged out" });
});




module.exports = router;

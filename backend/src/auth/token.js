const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, phone: user.phone_no },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}


function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role_id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `${process.env.REFRESH_TOKEN_TTL_DAYS || 30}d` }
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { signAccessToken, signRefreshToken, hashToken };

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing access token" });
  }

  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.sub, role: payload.role, phone: payload.phone };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired access token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}



module.exports = { requireAuth, requireRole };

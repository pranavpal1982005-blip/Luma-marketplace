function csrf(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (!req.cookies?.csrf || req.cookies.csrf !== req.get("x-csrf-token")) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next();
}

module.exports = csrf;

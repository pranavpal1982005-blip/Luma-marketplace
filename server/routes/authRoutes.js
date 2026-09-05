const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setSession(res, user) {
  const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2 || !emailPattern.test(email || "") || !password || password.length < 8) {
    return res.status(400).json({ message: "Use a name, valid email, and password of at least 8 characters" });
  }
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    setSession(res, user);
    res.status(201).json({ user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Unable to create account" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!emailPattern.test(email || "") || !password) return res.status(400).json({ message: "Email and password are required" });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
  setSession(res, user);
  res.json({ user: { name: user.name, email: user.email, role: user.role } });
});

router.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.status(204).end();
});

module.exports = router;

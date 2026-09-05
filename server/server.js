const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

dotenv.config();

const app = express();

app.use(helmet());
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running" });
});

app.get("/api/csrf", (req, res) => {
  const token = crypto.randomBytes(24).toString("hex");
  res.cookie("csrf", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ token });
});

app.use("/api/auth", require("./middleware/csrf"), require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./middleware/csrf"), require("./routes/orderRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on http://localhost:" + (process.env.PORT || 5000));
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
const router = require("express").Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    res.json(await Product.find().sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: "Failed to load products" });
  }
});

module.exports = router;
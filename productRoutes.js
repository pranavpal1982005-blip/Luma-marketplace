const router = require("express").Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const paginated = req.query.page !== undefined || req.query.limit !== undefined;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 24, 1), 100);
    const query = {};
    if (typeof req.query.category === "string" && req.query.category.trim()) {
      query.category = req.query.category.trim();
    }
    const productQuery = Product.find(query).sort({ createdAt: -1 });
    if (paginated) productQuery.skip((page - 1) * limit).limit(limit);
    const [products, total] = await Promise.all([
      productQuery.lean(),
      Product.countDocuments(query)
    ]);
    if (!paginated) {
      res.json(products);
      return;
    }
    res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ message: "Failed to load products" });
  }
});

module.exports = router;
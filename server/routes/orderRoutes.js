const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.post("/", requireAuth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Your order has no items" });
  const ids = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.product);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) return null;
    return { product: product._id, name: product.name, price: product.price, quantity: item.quantity };
  });
  if (normalizedItems.some((item) => !item)) return res.status(400).json({ message: "One or more products are unavailable" });
  const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({ user: req.user.id, items: normalizedItems, total });
  res.status(201).json(order);
});

module.exports = router;

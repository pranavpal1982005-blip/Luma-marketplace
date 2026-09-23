const router = require("express").Router();
const Stripe = require("stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");

router.post("/create-checkout-session", requireAuth, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ message: "Stripe is not configured on the server" });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Your order has no items" });
  }

  const products = await Product.find({ _id: { $in: items.map((item) => item.product) } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const normalizedItems = items.map((item) => {
    const product = productMap.get(item.product);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
      return null;
    }
    return { product: product._id, name: product.name, price: product.price, quantity: item.quantity };
  });

  if (normalizedItems.some((item) => !item)) {
    return res.status(400).json({ message: "One or more products are unavailable" });
  }

  const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    user: req.user.id,
    items: normalizedItems,
    total,
    paymentProvider: "stripe"
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: normalizedItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      success_url: `${process.env.FRONTEND_URL}/?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/?payment=cancelled`,
      metadata: { orderId: order._id.toString() }
    });

    order.stripeSessionId = session.id;
    await order.save();
    res.json({ checkoutUrl: session.url });
  } catch {
    await Order.findByIdAndDelete(order._id);
    res.status(502).json({ message: "Unable to start secure checkout" });
  }
});

async function handleWebhook(req, res) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send("Stripe webhook is not configured");
  }
  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).send("Invalid Stripe signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await Order.findOneAndUpdate(
      { _id: session.metadata.orderId, stripeSessionId: session.id },
      { paymentStatus: "paid", status: "paid" }
    );
  }

  res.json({ received: true });
}

module.exports = { router, handleWebhook };

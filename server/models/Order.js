const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 }
    }],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
    paymentProvider: { type: String, enum: ["stripe", "razorpay", "none"], default: "none" },
    stripeSessionId: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

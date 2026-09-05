const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: String,
    image: String,
    category: String,
    brand: { type: String, trim: true },
    sellerType: { type: String, enum: ["Brand reference", "Independent seller"], default: "Independent seller" },
    stock: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
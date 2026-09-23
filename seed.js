const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const productTemplates = [
  ["Relaxed linen shirt", "Fashion"],
  ["Mini wireless speaker", "Electronics"],
  ["Velvet matte lipstick", "Beauty"],
  ["Bamboo storage basket", "Home"],
  ["Trail mix snack pack", "Grocery"],
  ["Daily comfort joggers", "Fashion"],
  ["Smart LED bulb", "Electronics"],
  ["Nourishing hair mask", "Beauty"],
  ["Modern wall clock", "Home"],
  ["Premium green tea", "Grocery"]
];

const brandsByCategory = {
  Fashion: ["Levi's", "Puma", "Van Heusen", "Roadster"],
  Electronics: ["boAt", "JBL", "Logitech", "Philips"],
  Beauty: ["Lakmé", "NIVEA", "Maybelline", "Mamaearth"],
  Home: ["Prestige", "Milton", "Wakefit", "IKEA"],
  Grocery: ["Tata", "Amul", "Britannia", "Fortune"]
};

const productImages = {
  "Relaxed linen shirt": "photo-1521572163474-6864f9cf17ab",
  "Classic canvas tote": "photo-1553062407-98eeb64c6a62",
  "Daily comfort joggers": "photo-1518611012118-696072aa579a",
  "Soft knit cardigan": "photo-1515886657613-9f3515b0c78f",
  "Mini wireless speaker": "photo-1505740420928-5e560c06d30e",
  "USB desk fan": "photo-1581091226825-a6a2a5aee158",
  "Smart LED bulb": "photo-1550989460-0adf9ea622e2",
  "Ergonomic mouse": "photo-1527814050087-3793815479db",
  "Velvet matte lipstick": "photo-1586495777744-4413f21062fa",
  "Aloe face wash": "photo-1556229010-6c3f2c9ca5f8",
  "Nourishing hair mask": "photo-1522337360788-8b13dee7a37e",
  "Fresh body mist": "photo-1596462502278-27bfdc403348",
  "Bamboo storage basket": "photo-1595428774223-ef52624120d2",
  "Cotton hand towel": "photo-1583845112203-454c7b4b1f6a",
  "Modern wall clock": "photo-1563861826100-9cb868fdbe1c",
  "Wooden serving tray": "photo-1610701596007-11502861dcfa",
  "Trail mix snack pack": "photo-1599599810769-bcde5a160d32",
  "Cold pressed cooking oil": "photo-1474979266404-7eaacbcd87c5",
  "Premium green tea": "photo-1556679343-c7306c1976bc",
  "Multigrain breakfast oats": "photo-1517093728432-a0440f8d45af"
};

const products = Array.from({ length: 300 }, (_, index) => {
  const [template, category] = productTemplates[index % productTemplates.length];
  const price = 149 + ((index * 73) % 751);
  return {
    name: `${template} ${index + 1}`,
    price,
    category,
    brand: brandsByCategory[category][index % brandsByCategory[category].length],
    sellerType: "Brand reference",
    stock: 20 + (index % 70),
    description: `Affordable ${category.toLowerCase()} essential for everyday use`,
    image: `https://images.unsplash.com/${productImages[template]}?auto=format&fit=crop&w=800&q=80`
  };
});

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.bulkWrite(products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true
      }
    })));
    console.log("Affordable products added successfully");
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
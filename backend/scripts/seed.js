// backend/scripts/seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("../src/models/User").default || require("../src/models/User");
const Referral = require("../src/models/Referral").default || require("../src/models/Referral");

async function run() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI missing in .env");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Cleanup old test users (optional)
    await User.deleteMany({
      email: { $in: ["lina@example.com", "ryan@example.com"] },
    });

    // Create hashed password
    const hash = await bcrypt.hash("123456", 10);

    // Create Lina (referrer)
    const lina = new User({
      name: "Lina",
      email: "lina@example.com",
      passwordHash: hash,
      referralCode: "LINA_TEST_001",
      credits: 0,
    });
    await lina.save();

    // Create Ryan (referred)
    const ryan = new User({
      name: "Ryan",
      email: "ryan@example.com",
      passwordHash: hash,
      referralCode: "RYAN_TEST_001",
      credits: 0,
    });
    await ryan.save();

    // Link referral (Lina referred Ryan)
    await Referral.create({
      referrerId: lina._id,
      referredId: ryan._id,
      status: "pending",
    });

    console.log("✅ Seed complete:");
    console.log("- User A: lina@example.com / 123456");
    console.log("- User B: ryan@example.com / 123456");
    console.log("Referral: Lina → Ryan");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import purchaseRoutes from "./routes/purchase";
import dashboardRoutes from "./routes/dashboard";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const MONGO_URI = process.env.MONGO_URI!;
    if (!MONGO_URI) throw new Error("MONGO_URI missing");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();

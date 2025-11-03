import express from "express";
import Purchase from "../models/Purchase";
import Referral from "../models/Referral";
import User from "../models/User";
import mongoose from "mongoose";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/purchase
 * body: { amount: number }
 * Auth required.
 */
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const user = req.user;
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // check if user already has a purchase (first purchase only triggers credits)
    const firstPurchase = (await Purchase.countDocuments({ userId: user._id }).session(session)) === 0;

    const purchase = new Purchase({ userId: user._id, amount });
    await purchase.save({ session });

    if (firstPurchase) {
      // find referral record where referredId == user._id and status pending
      const referral = await Referral.findOne({ referredId: user._id, status: "pending" }).session(session);
      if (referral) {
        // credit both referrer and referred user 2 credits
        const referrer = await User.findById(referral.referrerId).session(session);
        const referred = await User.findById(referral.referredId).session(session);
        if (referrer && referred) {
          referrer.credits += 2;
          referred.credits += 2;
          await referrer.save({ session });
          await referred.save({ session });
          referral.status = "converted";
          await referral.save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Purchase completed", purchase });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: "Purchase failed" });
  }
});

export default router;

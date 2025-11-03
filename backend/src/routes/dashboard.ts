import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import Referral from "../models/Referral";
import Purchase from "../models/Purchase";
import User from "../models/User";

const router = express.Router();

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    const referredCount = await Referral.countDocuments({ referrerId: user._id });
    const convertedCount = await Referral.countDocuments({ referrerId: user._id, status: "converted" });

    // total credits from user record
    const freshUser = await User.findById(user._id).select("credits referralCode name email");

    res.json({
      referredCount,
      convertedCount,
      totalCredits: freshUser?.credits ?? 0,
      referralCode: freshUser?.referralCode ?? null,
      user: { name: freshUser?.name, email: freshUser?.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

export default router;

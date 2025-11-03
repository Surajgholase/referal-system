import express from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import User from "../models/User";
import Referral from "../models/Referral";
import { registerSchema, loginSchema } from "../validation/schemas";
import { signToken } from "../utils/jwt";

const router = express.Router();

/**
 * Register
 * Accepts optional referralCode in body (or you can pass it during registration from ?r=code).
 */
router.post("/register", async (req, res) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const { name, email, password, referralCode } = parse.data;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    // generate a unique referral code, e.g., NAME123 or random
    const base = (name || "USER").toUpperCase().replace(/\s+/g, "").slice(0, 6);
    const referralCodeGenerated = `${base}${nanoid(6).toUpperCase()}`;

    const user = new User({
      name,
      email,
      passwordHash,
      referralCode: referralCodeGenerated,
      credits: 0,
    });

    await user.save();

    // If referralCode provided — find referrer and create Referral record
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toString() });
      if (referrer) {
        try {
          const referral = new Referral({
            referrerId: referrer._id,
            referredId: user._id,
          });
          await referral.save();
        } catch (err) {
          // duplicate referral or other issue -> ignore to avoid crashing register
        }
      }
    }

    const token = signToken({ id: user._id });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });

    const { email, password } = parse.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        credits: user.credits,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

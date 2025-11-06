"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nanoid_1 = require("nanoid");
const User_1 = __importDefault(require("../models/User"));
const Referral_1 = __importDefault(require("../models/Referral"));
const schemas_1 = require("../validation/schemas");
const jwt_1 = require("../utils/jwt");
const router = express_1.default.Router();
/**
 * Register
 * Accepts optional referralCode in body (or you can pass it during registration from ?r=code).
 */
router.post("/register", async (req, res) => {
    try {
        const parse = schemas_1.registerSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.issues });
        const { name, email, password, referralCode } = parse.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User_1.default.findOne({ email: normalizedEmail });
        if (existing)
            return res.status(400).json({ message: "Email already in use" });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // generate a unique referral code, e.g., NAME123 or random
        const base = (name || "USER").toUpperCase().replace(/\s+/g, "").slice(0, 6);
        const referralCodeGenerated = `${base}${(0, nanoid_1.nanoid)(6).toUpperCase()}`;
        const user = new User_1.default({
            name,
            email: normalizedEmail,
            passwordHash,
            referralCode: referralCodeGenerated,
            credits: 0,
        });
        await user.save();
        // If referralCode provided — find referrer and create Referral record
        if (referralCode) {
            const referrer = await User_1.default.findOne({ referralCode: referralCode.toString() });
            if (referrer) {
                try {
                    const referral = new Referral_1.default({
                        referrerId: referrer._id,
                        referredId: user._id,
                    });
                    await referral.save();
                }
                catch (err) {
                    // duplicate referral or other issue -> ignore to avoid crashing register
                }
            }
        }
        const token = (0, jwt_1.signToken)({ id: user._id });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const parse = schemas_1.loginSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.issues });
        const { email, password } = parse.data;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.default.findOne({ email: normalizedEmail });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(400).json({ message: "Invalid credentials" });
        const token = (0, jwt_1.signToken)({ id: user._id });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;

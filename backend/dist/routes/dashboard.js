"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Referral_1 = __importDefault(require("../models/Referral"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const referredCount = await Referral_1.default.countDocuments({ referrerId: user._id });
        const convertedCount = await Referral_1.default.countDocuments({ referrerId: user._id, status: "converted" });
        // total credits from user record
        const freshUser = await User_1.default.findById(user._id).select("credits referralCode name email");
        res.json({
            referredCount,
            convertedCount,
            totalCredits: freshUser?.credits ?? 0,
            referralCode: freshUser?.referralCode ?? null,
            user: { name: freshUser?.name, email: freshUser?.email },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch dashboard" });
    }
});
exports.default = router;

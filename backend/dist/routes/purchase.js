"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const Referral_1 = __importDefault(require("../models/Referral"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * POST /api/purchase
 * body: { amount: number }
 * Auth required.
 */
router.post("/", auth_1.authMiddleware, async (req, res) => {
    const user = req.user;
    const { amount } = req.body;
    if (!amount || amount <= 0)
        return res.status(400).json({ message: "Invalid amount" });
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // check if user already has a purchase (first purchase only triggers credits)
        const firstPurchase = (await Purchase_1.default.countDocuments({ userId: user._id }).session(session)) === 0;
        const purchase = new Purchase_1.default({ userId: user._id, amount });
        await purchase.save({ session });
        if (firstPurchase) {
            // find referral record where referredId == user._id and status pending
            const referral = await Referral_1.default.findOne({ referredId: user._id, status: "pending" }).session(session);
            if (referral) {
                // credit both referrer and referred user 2 credits
                const referrer = await User_1.default.findById(referral.referrerId).session(session);
                const referred = await User_1.default.findById(referral.referredId).session(session);
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
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        res.status(500).json({ message: "Purchase failed" });
    }
});
exports.default = router;

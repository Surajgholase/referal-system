"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReferralSchema = new mongoose_1.Schema({
    referrerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    referredId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "converted"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});
ReferralSchema.index({ referrerId: 1, referredId: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Referral", ReferralSchema);

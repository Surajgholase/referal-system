"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PurchaseSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});
PurchaseSchema.index({ userId: 1, createdAt: 1 });
exports.default = (0, mongoose_1.model)("Purchase", PurchaseSchema);

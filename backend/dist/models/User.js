"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    referralCode: { type: String, required: true, unique: true },
    credits: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)("User", UserSchema);

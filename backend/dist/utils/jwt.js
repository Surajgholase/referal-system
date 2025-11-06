"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
function signToken(payload) {
    if (!JWT_SECRET)
        throw new Error("JWT_SECRET missing");
    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const expiresIn = (expiresInEnv ?? "7d");
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
}
function verifyToken(token) {
    if (!JWT_SECRET)
        throw new Error("JWT_SECRET missing");
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}

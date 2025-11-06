"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
async function authMiddleware(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header)
            return res.status(401).json({ message: "Missing auth header" });
        const token = header.replace("Bearer ", "");
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await User_1.default.findById(payload.id).select("-passwordHash");
        if (!user)
            return res.status(401).json({ message: "User not found" });
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

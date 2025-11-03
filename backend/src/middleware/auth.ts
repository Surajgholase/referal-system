import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing auth header" });
    const token = header.replace("Bearer ", "");
    const payload = verifyToken(token);
    const user = await User.findById((payload as any).id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

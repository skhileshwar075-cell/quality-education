import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export async function protect(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env["JWT_SECRET"] || process.env["SESSION_SECRET"] || "fallback_secret";

  try {
    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = { id: String(user._id), role: user.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

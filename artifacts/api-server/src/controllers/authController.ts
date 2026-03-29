import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";

function generateToken(id: string, role: string) {
  const secret = process.env["JWT_SECRET"] || process.env["SESSION_SECRET"] || "fallback_secret";
  return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(String(user._id), user.role);
    res.status(201).json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(String(user._id), user.role);
    res.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ id: String(user._id), name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(500).json({ message: "Failed to get user" });
  }
}

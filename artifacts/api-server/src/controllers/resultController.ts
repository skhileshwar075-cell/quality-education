import { Response } from "express";
import { Result } from "../models/Result.js";
import { User } from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";

export async function getMyResults(req: AuthRequest, res: Response) {
  try {
    const results = await Result.find({ userId: req.user!.id })
      .populate("subjectId", "title")
      .sort({ createdAt: -1 });

    res.json(
      results.map((r: any) => ({
        id: String(r._id),
        userId: String(r.userId),
        subjectId: String(r.subjectId._id),
        subjectTitle: r.subjectId.title,
        score: r.score,
        total: r.total,
        percentage: r.percentage,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch {
    res.status(500).json({ message: "Failed to fetch results" });
  }
}

export async function getAllResults(_req: AuthRequest, res: Response) {
  try {
    const results = await Result.find()
      .populate("subjectId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(
      results.map((r: any) => ({
        id: String(r._id),
        userId: String(r.userId._id),
        userName: r.userId.name,
        userEmail: r.userId.email,
        subjectId: String(r.subjectId._id),
        subjectTitle: r.subjectId.title,
        score: r.score,
        total: r.total,
        percentage: r.percentage,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch {
    res.status(500).json({ message: "Failed to fetch results" });
  }
}

export async function markLessonComplete(req: AuthRequest, res: Response) {
  const { contentId } = req.body;
  if (!contentId) {
    res.status(400).json({ message: "contentId is required" });
    return;
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $addToSet: { completedLessons: contentId } },
      { new: true }
    );
    res.json({ completedLessons: user?.completedLessons || [] });
  } catch {
    res.status(500).json({ message: "Failed to mark lesson complete" });
  }
}

export async function getMyProgress(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.user!.id).select("completedLessons");
    res.json(user?.completedLessons || []);
  } catch {
    res.status(500).json({ message: "Failed to fetch progress" });
  }
}

export async function getUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await User.find().select("-password");
    res.json(
      users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
      }))
    );
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

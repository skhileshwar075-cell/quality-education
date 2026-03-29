import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Result } from "../models/Result.js";
import { Subject } from "../models/Subject.js";

export async function getUserAnalytics(req: Request, res: Response) {
  try {
    const total = await User.countDocuments({ role: "user" });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, role: "user" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ total, growth });
  } catch {
    res.status(500).json({ message: "Failed to fetch user analytics" });
  }
}

export async function getQuizAnalytics(req: Request, res: Response) {
  try {
    const subjects = await Subject.find();
    const attempts = await Result.aggregate([
      {
        $group: {
          _id: "$subjectId",
          attempts: { $sum: 1 },
        },
      },
    ]);

    const subjectMap: Record<string, string> = {};
    subjects.forEach((s) => {
      subjectMap[String(s._id)] = s.title;
    });

    const data = attempts.map((a) => ({
      subject: subjectMap[String(a._id)] || "Unknown",
      attempts: a.attempts,
    }));

    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch quiz analytics" });
  }
}

export async function getScoreAnalytics(req: Request, res: Response) {
  try {
    const subjects = await Subject.find();
    const scores = await Result.aggregate([
      {
        $group: {
          _id: "$subjectId",
          avgScore: { $avg: "$percentage" },
        },
      },
    ]);

    const subjectMap: Record<string, string> = {};
    subjects.forEach((s) => {
      subjectMap[String(s._id)] = s.title;
    });

    const data = scores.map((s) => ({
      subject: subjectMap[String(s._id)] || "Unknown",
      avgScore: Math.round(s.avgScore),
    }));

    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch score analytics" });
  }
}

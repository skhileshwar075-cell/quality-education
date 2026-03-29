import { Request, Response } from "express";
import { Quiz } from "../models/Quiz.js";
import { Result } from "../models/Result.js";
import { AuthRequest } from "../middleware/auth.js";

function formatQuiz(q: any) {
  return {
    id: String(q._id),
    subjectId: String(q.subjectId),
    questions: q.questions.map((qn: any) => ({
      id: qn.id,
      question: qn.question,
      options: qn.options,
      correctAnswer: qn.correctAnswer,
    })),
  };
}

export async function getQuiz(req: Request, res: Response) {
  try {
    const quiz = await Quiz.findOne({ subjectId: req.params["subjectId"] });
    if (!quiz) {
      res.status(404).json({ message: "No quiz found for this subject" });
      return;
    }
    res.json(formatQuiz(quiz));
  } catch {
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
}

export async function submitQuiz(req: AuthRequest, res: Response) {
  const { subjectId, answers } = req.body;
  if (!subjectId || !Array.isArray(answers)) {
    res.status(400).json({ message: "subjectId and answers array are required" });
    return;
  }

  try {
    const quiz = await Quiz.findOne({ subjectId });
    if (!quiz) {
      res.status(404).json({ message: "No quiz found for this subject" });
      return;
    }

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const result = await Result.create({
      userId: req.user!.id,
      subjectId,
      score,
      total,
      percentage,
    });

    res.json({
      id: String(result._id),
      userId: String(result.userId),
      subjectId: String(result.subjectId),
      score,
      total,
      percentage,
    });
  } catch {
    res.status(500).json({ message: "Failed to submit quiz" });
  }
}

export async function createQuiz(req: Request, res: Response) {
  const { subjectId, questions } = req.body;
  if (!subjectId || !Array.isArray(questions)) {
    res.status(400).json({ message: "subjectId and questions are required" });
    return;
  }
  try {
    const existing = await Quiz.findOne({ subjectId });
    if (existing) {
      res.status(400).json({ message: "Quiz already exists for this subject. Use PUT to update." });
      return;
    }
    const quiz = await Quiz.create({ subjectId, questions });
    res.status(201).json(formatQuiz(quiz));
  } catch {
    res.status(500).json({ message: "Failed to create quiz" });
  }
}

export async function updateQuiz(req: Request, res: Response) {
  const { subjectId, questions } = req.body;
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params["id"],
      { subjectId, questions },
      { new: true, runValidators: true }
    );
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    res.json(formatQuiz(quiz));
  } catch {
    res.status(500).json({ message: "Failed to update quiz" });
  }
}

export async function deleteQuiz(req: Request, res: Response) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params["id"]);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    res.json({ message: "Quiz deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete quiz" });
  }
}

import { Request, Response } from "express";
import { Quiz } from "../models/Quiz.js";
import { Result } from "../models/Result.js";
import { Content } from "../models/Content.js";
import { AuthRequest } from "../middleware/auth.js";

function formatQuestions(questions: any[], includeTopicId = false) {
  return questions.map((qn: any) => ({
    id: qn.id,
    question: qn.question,
    options: qn.options,
    correctAnswer: qn.correctAnswer,
    ...(includeTopicId ? { topicId: qn.topicId || "" } : {}),
  }));
}

function formatQuiz(q: any, questions?: any[]) {
  return {
    id: String(q._id),
    subjectId: String(q.subjectId),
    questions: formatQuestions(questions || q.questions),
  };
}

/* ── Subject-level quiz ─────────────────────────────────────────────────────── */
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
    if (!quiz) { res.status(404).json({ message: "No quiz found for this subject" }); return; }

    let score = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const result = await Result.create({ userId: req.user!.id, subjectId, score, total, percentage });
    res.json({ id: String(result._id), userId: String(result.userId), subjectId: String(result.subjectId), score, total, percentage });
  } catch {
    res.status(500).json({ message: "Failed to submit quiz" });
  }
}

/* ── Topic-level quiz ───────────────────────────────────────────────────────── */
export async function getTopicQuiz(req: AuthRequest, res: Response) {
  const { topicId } = req.params;
  try {
    const topic = await Content.findById(topicId);
    if (!topic) { res.status(404).json({ message: "Topic not found" }); return; }

    const quiz = await Quiz.findOne({ subjectId: topic.subjectId });
    if (!quiz || quiz.questions.length === 0) {
      res.status(404).json({ message: "No quiz for this subject" });
      return;
    }

    // Filter questions linked to this topic, fall back to ALL if none tagged
    const topicQs = quiz.questions.filter(q => q.topicId === topicId);
    const questions = topicQs.length > 0 ? topicQs : quiz.questions;

    res.json({
      id: String(quiz._id),
      subjectId: String(quiz.subjectId),
      topicId,
      isTopicSpecific: topicQs.length > 0,
      questions: formatQuestions(questions),
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch topic quiz" });
  }
}

export async function submitTopicQuiz(req: AuthRequest, res: Response) {
  const { topicId, answers } = req.body;
  if (!topicId || !Array.isArray(answers)) {
    res.status(400).json({ message: "topicId and answers array are required" });
    return;
  }
  try {
    const topic = await Content.findById(topicId);
    if (!topic) { res.status(404).json({ message: "Topic not found" }); return; }

    const quiz = await Quiz.findOne({ subjectId: topic.subjectId });
    if (!quiz) { res.status(404).json({ message: "No quiz for this subject" }); return; }

    const topicQs = quiz.questions.filter(q => q.topicId === topicId);
    const questions = topicQs.length > 0 ? topicQs : quiz.questions;

    let score = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const result = await Result.create({
      userId: req.user!.id,
      subjectId: topic.subjectId,
      score, total, percentage,
    });
    res.json({ id: String(result._id), subjectId: String(topic.subjectId), topicId, score, total, percentage });
  } catch {
    res.status(500).json({ message: "Failed to submit topic quiz" });
  }
}

/* ── Admin CRUD ─────────────────────────────────────────────────────────────── */
export async function createQuiz(req: Request, res: Response) {
  const { subjectId, questions } = req.body;
  if (!subjectId || !Array.isArray(questions)) {
    res.status(400).json({ message: "subjectId and questions are required" });
    return;
  }
  try {
    const existing = await Quiz.findOne({ subjectId });
    if (existing) { res.status(400).json({ message: "Quiz already exists. Use PUT to update." }); return; }
    const quiz = await Quiz.create({ subjectId, questions });
    res.status(201).json(formatQuiz(quiz));
  } catch {
    res.status(500).json({ message: "Failed to create quiz" });
  }
}

export async function updateQuiz(req: Request, res: Response) {
  const { subjectId, questions } = req.body;
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params["id"], { subjectId, questions }, { new: true, runValidators: true });
    if (!quiz) { res.status(404).json({ message: "Quiz not found" }); return; }
    res.json(formatQuiz(quiz));
  } catch {
    res.status(500).json({ message: "Failed to update quiz" });
  }
}

export async function deleteQuiz(req: Request, res: Response) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params["id"]);
    if (!quiz) { res.status(404).json({ message: "Quiz not found" }); return; }
    res.json({ message: "Quiz deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete quiz" });
  }
}

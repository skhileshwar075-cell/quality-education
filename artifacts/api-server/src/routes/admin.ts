import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { createSubject, updateSubject, deleteSubject } from "../controllers/subjectController.js";
import { createContent, updateContent, deleteContent } from "../controllers/contentController.js";
import { createQuiz, updateQuiz, deleteQuiz } from "../controllers/quizController.js";
import { getUsers, getAllResults } from "../controllers/resultController.js";
import { Content } from "../models/Content.js";
import { Quiz } from "../models/Quiz.js";
import { Subject } from "../models/Subject.js";
import { emitNotification } from "../lib/socket.js";
import type { Request, Response } from "express";

const router = Router();

router.use(protect, adminOnly);

router.post("/subjects", createSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

router.get("/content", async (req: Request, res: Response) => {
  try {
    const subjectId = req.query["subjectId"] as string | undefined;
    const filter = subjectId ? { subjectId } : {};
    const content = await Content.find(filter).sort({ createdAt: -1 });
    const subjects = await Subject.find();
    const subjectMap: Record<string, string> = {};
    subjects.forEach((s) => { subjectMap[String(s._id)] = s.title; });
    res.json(content.map((c) => ({
      id: String(c._id),
      subjectId: String(c.subjectId),
      subjectTitle: subjectMap[String(c.subjectId)] || "Unknown",
      title: c.title,
      notes: c.notes,
      videoUrl: c.videoUrl || "",
    })));
  } catch {
    res.status(500).json({ message: "Failed to fetch content" });
  }
});

router.post("/content", async (req: Request, res: Response) => {
  await createContent(req, res);
  const subject = await Subject.findById(req.body.subjectId);
  emitNotification("content:new", {
    subjectId: req.body.subjectId,
    subjectTitle: subject?.title || "Unknown",
    message: `New content added in ${subject?.title || "a subject"}`,
  });
});
router.put("/content/:id", updateContent);
router.delete("/content/:id", deleteContent);

router.get("/quiz", async (req: Request, res: Response) => {
  try {
    const subjectId = req.query["subjectId"] as string | undefined;
    const filter = subjectId ? { subjectId } : {};
    const quizzes = await Quiz.find(filter);
    const subjects = await Subject.find();
    const subjectMap: Record<string, string> = {};
    subjects.forEach((s) => { subjectMap[String(s._id)] = s.title; });
    res.json(quizzes.map((q) => ({
      id: String(q._id),
      subjectId: String(q.subjectId),
      subjectTitle: subjectMap[String(q.subjectId)] || "Unknown",
      questions: q.questions.map((qn) => ({
        id: qn.id,
        question: qn.question,
        options: qn.options,
        correctAnswer: qn.correctAnswer,
      })),
    })));
  } catch {
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
});
router.post("/quiz", createQuiz);
router.put("/quiz/:id", updateQuiz);
router.delete("/quiz/:id", deleteQuiz);

router.get("/users", getUsers);
router.get("/results", getAllResults);

export default router;

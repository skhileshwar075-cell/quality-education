import { Router } from "express";
import { getQuiz, submitQuiz, getTopicQuiz, submitTopicQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Topic-specific quiz routes (must be before /:subjectId to avoid conflicts)
router.get("/topic/:topicId", protect, getTopicQuiz);
router.post("/topic/submit", protect, submitTopicQuiz);

// Subject-level quiz routes
router.get("/:subjectId", protect, getQuiz);
router.post("/submit", protect, submitQuiz);

export default router;

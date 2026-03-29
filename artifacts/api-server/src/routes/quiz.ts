import { Router } from "express";
import { getQuiz, submitQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/:subjectId", protect, getQuiz);
router.post("/submit", protect, submitQuiz);

export default router;

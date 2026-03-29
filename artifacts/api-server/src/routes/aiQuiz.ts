import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { generateQuiz, saveGeneratedQuiz } from "../controllers/aiQuizController.js";

const router = Router();

router.use(protect, adminOnly);

router.post("/generate", generateQuiz);
router.post("/save", saveGeneratedQuiz);

export default router;

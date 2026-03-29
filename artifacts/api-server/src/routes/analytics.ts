import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { getUserAnalytics, getQuizAnalytics, getScoreAnalytics } from "../controllers/analyticsController.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/users", getUserAnalytics);
router.get("/quizzes", getQuizAnalytics);
router.get("/scores", getScoreAnalytics);

export default router;

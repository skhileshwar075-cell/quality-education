import { Router } from "express";
import { markLessonComplete, getMyProgress, getMyResults } from "../controllers/resultController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/my", protect, getMyProgress);
router.post("/complete", protect, markLessonComplete);

export default router;

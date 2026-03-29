import { Router } from "express";
import { getMyResults } from "../controllers/resultController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/my", protect, getMyResults);

export default router;

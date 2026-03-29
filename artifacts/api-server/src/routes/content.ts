import { Router } from "express";
import { getContent } from "../controllers/contentController.js";

const router = Router();

router.get("/:subjectId", getContent);

export default router;

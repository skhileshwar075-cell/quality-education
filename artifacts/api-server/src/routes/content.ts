import { Router } from "express";
import { getContent, getContentById } from "../controllers/contentController.js";

const router = Router();

// Single topic by ID — must come before /:subjectId
router.get("/item/:id", getContentById);
router.get("/:subjectId", getContent);

export default router;

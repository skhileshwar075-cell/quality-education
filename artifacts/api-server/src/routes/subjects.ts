import { Router } from "express";
import { getSubjects, getSubject } from "../controllers/subjectController.js";

const router = Router();

router.get("/", getSubjects);
router.get("/:id", getSubject);

export default router;

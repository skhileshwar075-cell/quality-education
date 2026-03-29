import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { createSubject, updateSubject, deleteSubject } from "../controllers/subjectController.js";
import { createContent, updateContent, deleteContent } from "../controllers/contentController.js";
import { createQuiz, updateQuiz, deleteQuiz } from "../controllers/quizController.js";
import { getUsers, getAllResults } from "../controllers/resultController.js";

const router = Router();

router.use(protect, adminOnly);

router.post("/subjects", createSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

router.post("/content", createContent);
router.put("/content/:id", updateContent);
router.delete("/content/:id", deleteContent);

router.post("/quiz", createQuiz);
router.put("/quiz/:id", updateQuiz);
router.delete("/quiz/:id", deleteQuiz);

router.get("/users", getUsers);
router.get("/results", getAllResults);

export default router;

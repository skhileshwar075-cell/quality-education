import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import subjectsRouter from "./subjects.js";
import contentRouter from "./content.js";
import quizRouter from "./quiz.js";
import progressRouter from "./progress.js";
import resultsRouter from "./results.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/subjects", subjectsRouter);
router.use("/content", contentRouter);
router.use("/quiz", quizRouter);
router.use("/progress", progressRouter);
router.use("/results", resultsRouter);
router.use("/admin", adminRouter);

export default router;

import { Router } from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/auth.js";
import { bulkUploadQuiz, previewCsv } from "../controllers/uploadController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

const router = Router();

router.use(protect, adminOnly);

router.post("/quiz/preview", upload.single("file"), previewCsv);
router.post("/quiz/bulk-upload", upload.single("file"), bulkUploadQuiz);

export default router;

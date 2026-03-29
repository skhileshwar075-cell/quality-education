import { Request, Response } from "express";
import { Quiz } from "../models/Quiz.js";
import { Subject } from "../models/Subject.js";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { emitNotification } from "../lib/socket.js";

interface CsvRow {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: string;
  subjectId: string;
}

export async function bulkUploadQuiz(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ message: "No CSV file uploaded" });
    return;
  }

  const rows: CsvRow[] = [];
  const errors: string[] = [];

  const stream = Readable.from(req.file.buffer);

  try {
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (row: CsvRow) => rows.push(row))
        .on("error", reject)
        .on("end", resolve);
    });
  } catch {
    res.status(400).json({ message: "Failed to parse CSV file" });
    return;
  }

  if (rows.length === 0) {
    res.status(400).json({ message: "CSV file is empty" });
    return;
  }

  const required = ["question", "option1", "option2", "option3", "option4", "correctAnswer", "subjectId"];
  const firstRow = rows[0];
  for (const field of required) {
    if (!(field in firstRow)) {
      res.status(400).json({ message: `CSV missing required column: ${field}` });
      return;
    }
  }

  const grouped: Record<string, { question: string; options: string[]; correctAnswer: number }[]> = {};

  rows.forEach((row, idx) => {
    const lineNo = idx + 2;
    if (!row.question?.trim()) { errors.push(`Row ${lineNo}: missing question`); return; }
    if (!row.subjectId?.trim()) { errors.push(`Row ${lineNo}: missing subjectId`); return; }
    const ans = parseInt(row.correctAnswer, 10);
    if (isNaN(ans) || ans < 0 || ans > 3) { errors.push(`Row ${lineNo}: correctAnswer must be 0-3`); return; }

    if (!grouped[row.subjectId]) grouped[row.subjectId] = [];
    grouped[row.subjectId].push({
      question: row.question.trim(),
      options: [
        row.option1?.trim() || "",
        row.option2?.trim() || "",
        row.option3?.trim() || "",
        row.option4?.trim() || "",
      ],
      correctAnswer: ans,
    });
  });

  const inserted: string[] = [];

  for (const [subjectId, questions] of Object.entries(grouped)) {
    const subject = await Subject.findById(subjectId);
    if (!subject) { errors.push(`Subject not found: ${subjectId}`); continue; }

    const questionsWithIds = questions.map((q, i) => ({
      ...q,
      id: `${subjectId}_${Date.now()}_${i}`,
    }));

    const existing = await Quiz.findOne({ subjectId });
    if (existing) {
      existing.questions.push(...(questionsWithIds as any));
      await existing.save();
    } else {
      await Quiz.create({ subjectId, questions: questionsWithIds });
    }

    emitNotification("quiz:updated", { subjectId, subjectTitle: subject.title });
    inserted.push(subjectId);
  }

  res.json({
    message: "Bulk upload complete",
    insertedSubjects: inserted.length,
    errors,
  });
}

export async function previewCsv(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ message: "No CSV file uploaded" });
    return;
  }

  const rows: CsvRow[] = [];
  const stream = Readable.from(req.file.buffer);

  try {
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (row: CsvRow) => rows.push(row))
        .on("error", reject)
        .on("end", resolve);
    });
  } catch {
    res.status(400).json({ message: "Failed to parse CSV file" });
    return;
  }

  res.json({ rows: rows.slice(0, 20), total: rows.length });
}

import mongoose from "mongoose";

export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface IQuiz extends mongoose.Document {
  subjectId: mongoose.Types.ObjectId;
  questions: IQuestion[];
}

const questionSchema = new mongoose.Schema<IQuestion>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema<IQuiz>(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, unique: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);

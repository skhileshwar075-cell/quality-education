import mongoose from "mongoose";

export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topicId?: string;      // optional link to a Content/Topic _id
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
    topicId: { type: String, default: "" },
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

import mongoose from "mongoose";

export interface IResult extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  score: number;
  total: number;
  percentage: number;
}

const resultSchema = new mongoose.Schema<IResult>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Result = mongoose.model<IResult>("Result", resultSchema);

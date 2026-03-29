import mongoose from "mongoose";

export interface ISubject extends mongoose.Document {
  title: string;
  description: string;
}

const subjectSchema = new mongoose.Schema<ISubject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>("Subject", subjectSchema);

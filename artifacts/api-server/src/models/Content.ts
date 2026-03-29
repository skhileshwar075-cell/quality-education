import mongoose from "mongoose";

export interface IContent extends mongoose.Document {
  subjectId: mongoose.Types.ObjectId;
  title: string;
  notes: string;
  videoUrl?: string;
}

const contentSchema = new mongoose.Schema<IContent>(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, required: true },
    videoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Content = mongoose.model<IContent>("Content", contentSchema);

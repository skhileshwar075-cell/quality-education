import { Request, Response } from "express";
import { Content } from "../models/Content.js";

function formatContent(c: any) {
  return {
    id: String(c._id),
    subjectId: String(c.subjectId),
    title: c.title,
    notes: c.notes,
    videoUrl: c.videoUrl || "",
  };
}

export async function getContent(req: Request, res: Response) {
  try {
    const content = await Content.find({ subjectId: req.params["subjectId"] });
    res.json(content.map(formatContent));
  } catch {
    res.status(500).json({ message: "Failed to fetch content" });
  }
}

export async function createContent(req: Request, res: Response) {
  const { subjectId, title, notes, videoUrl } = req.body;
  if (!subjectId || !title || !notes) {
    res.status(400).json({ message: "subjectId, title, and notes are required" });
    return;
  }
  try {
    const content = await Content.create({ subjectId, title, notes, videoUrl: videoUrl || "" });
    res.status(201).json(formatContent(content));
  } catch {
    res.status(500).json({ message: "Failed to create content" });
  }
}

export async function updateContent(req: Request, res: Response) {
  const { subjectId, title, notes, videoUrl } = req.body;
  try {
    const content = await Content.findByIdAndUpdate(
      req.params["id"],
      { subjectId, title, notes, videoUrl: videoUrl || "" },
      { new: true, runValidators: true }
    );
    if (!content) {
      res.status(404).json({ message: "Content not found" });
      return;
    }
    res.json(formatContent(content));
  } catch {
    res.status(500).json({ message: "Failed to update content" });
  }
}

export async function deleteContent(req: Request, res: Response) {
  try {
    const content = await Content.findByIdAndDelete(req.params["id"]);
    if (!content) {
      res.status(404).json({ message: "Content not found" });
      return;
    }
    res.json({ message: "Content deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete content" });
  }
}

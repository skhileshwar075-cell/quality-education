import { Request, Response } from "express";
import { Subject } from "../models/Subject.js";

export async function getSubjects(_req: Request, res: Response) {
  try {
    const subjects = await Subject.find();
    res.json(subjects.map((s) => ({ id: String(s._id), title: s.title, description: s.description })));
  } catch {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
}

export async function getSubject(req: Request, res: Response) {
  try {
    const subject = await Subject.findById(req.params["id"]);
    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }
    res.json({ id: String(subject._id), title: subject.title, description: subject.description });
  } catch {
    res.status(500).json({ message: "Failed to fetch subject" });
  }
}

export async function createSubject(req: Request, res: Response) {
  const { title, description } = req.body;
  if (!title || !description) {
    res.status(400).json({ message: "Title and description are required" });
    return;
  }
  try {
    const subject = await Subject.create({ title, description });
    res.status(201).json({ id: String(subject._id), title: subject.title, description: subject.description });
  } catch {
    res.status(500).json({ message: "Failed to create subject" });
  }
}

export async function updateSubject(req: Request, res: Response) {
  const { title, description } = req.body;
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params["id"],
      { title, description },
      { new: true, runValidators: true }
    );
    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }
    res.json({ id: String(subject._id), title: subject.title, description: subject.description });
  } catch {
    res.status(500).json({ message: "Failed to update subject" });
  }
}

export async function deleteSubject(req: Request, res: Response) {
  try {
    const subject = await Subject.findByIdAndDelete(req.params["id"]);
    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }
    res.json({ message: "Subject deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete subject" });
  }
}

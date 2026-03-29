import { Request, Response } from "express";
import { Quiz } from "../models/Quiz.js";
import { Subject } from "../models/Subject.js";
import { emitNotification } from "../lib/socket.js";

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

function generateMockQuestions(subject: string, topic: string, count: number): GeneratedQuestion[] {
  const templates = [
    {
      q: `What is the primary concept behind ${topic} in ${subject}?`,
      options: [
        `The fundamental principle of ${topic}`,
        `A secondary aspect of ${subject}`,
        `An unrelated concept in ${subject}`,
        `The opposite of ${topic}`,
      ],
      answer: 0,
    },
    {
      q: `Which of the following best describes ${topic}?`,
      options: [
        `A method unrelated to ${subject}`,
        `The core definition of ${topic} in ${subject}`,
        `A historical term for ${subject}`,
        `An advanced form of ${topic}`,
      ],
      answer: 1,
    },
    {
      q: `In ${subject}, ${topic} is most commonly associated with:`,
      options: [
        `Complex abstract theories`,
        `Random historical events`,
        `Practical real-world applications`,
        `None of the above`,
      ],
      answer: 2,
    },
    {
      q: `Who is credited with developing the foundational ideas of ${topic}?`,
      options: [
        `A pioneer in ${subject} research`,
        `A scientist from an unrelated field`,
        `A contemporary practitioner`,
        `A philosopher unrelated to ${subject}`,
      ],
      answer: 0,
    },
    {
      q: `What is the main advantage of studying ${topic} in ${subject}?`,
      options: [
        `It has no practical use`,
        `It complicates the understanding of ${subject}`,
        `It provides insight into real-world problems`,
        `It replaces all other topics in ${subject}`,
      ],
      answer: 2,
    },
    {
      q: `Which statement about ${topic} is FALSE?`,
      options: [
        `${topic} is a key part of ${subject}`,
        `${topic} has no practical applications`,
        `${topic} can be studied academically`,
        `${topic} relates to broader concepts in ${subject}`,
      ],
      answer: 1,
    },
    {
      q: `How does ${topic} relate to other concepts in ${subject}?`,
      options: [
        `It is completely independent`,
        `It builds on foundational ${subject} principles`,
        `It contradicts other ${subject} concepts`,
        `It only applies to advanced ${subject} studies`,
      ],
      answer: 1,
    },
    {
      q: `A student studying ${topic} in ${subject} would most benefit from understanding:`,
      options: [
        `Unrelated historical facts`,
        `Core principles of ${subject}`,
        `Advanced mathematics only`,
        `Literature unrelated to ${subject}`,
      ],
      answer: 1,
    },
    {
      q: `The study of ${topic} in ${subject} contributes to:`,
      options: [
        `Confusion in academic discourse`,
        `Better understanding of ${subject} as a whole`,
        `Replacing existing ${subject} theories`,
        `Ignoring foundational ${subject} concepts`,
      ],
      answer: 1,
    },
    {
      q: `Which field is most closely related to ${topic} in ${subject}?`,
      options: [
        `An entirely different academic discipline`,
        `A sub-field of ${subject}`,
        `A non-academic pursuit`,
        `An ancient form of ${subject}`,
      ],
      answer: 1,
    },
  ];

  const used = templates.slice(0, Math.min(count, templates.length));
  while (used.length < count) {
    const extra = templates[used.length % templates.length];
    used.push({ ...extra, q: `(Q${used.length + 1}) ${extra.q}` });
  }

  return used.slice(0, count).map((t) => ({
    question: t.q,
    options: t.options,
    correctAnswer: t.answer,
  }));
}

export async function generateQuiz(req: Request, res: Response) {
  const { subject, topic, numberOfQuestions, subjectId } = req.body;

  if (!subject || !topic || !numberOfQuestions) {
    res.status(400).json({ message: "subject, topic, and numberOfQuestions are required" });
    return;
  }

  const n = Math.min(Math.max(parseInt(numberOfQuestions, 10) || 5, 1), 10);
  const questions = generateMockQuestions(subject, topic, n);
  res.json({ questions, subject, topic });
}

export async function saveGeneratedQuiz(req: Request, res: Response) {
  const { subjectId, questions } = req.body;

  if (!subjectId || !Array.isArray(questions) || questions.length === 0) {
    res.status(400).json({ message: "subjectId and questions are required" });
    return;
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    res.status(404).json({ message: "Subject not found" });
    return;
  }

  const questionsWithIds = questions.map((q: any, i: number) => ({
    id: `${subjectId}_ai_${Date.now()}_${i}`,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));

  try {
    const existing = await Quiz.findOne({ subjectId });
    if (existing) {
      existing.questions.push(...(questionsWithIds as any));
      await existing.save();
    } else {
      await Quiz.create({ subjectId, questions: questionsWithIds });
    }

    emitNotification("quiz:new", {
      subjectId,
      subjectTitle: subject.title,
      message: `New AI quiz added in ${subject.title}`,
    });

    res.json({ message: "Quiz saved successfully", count: questions.length });
  } catch {
    res.status(500).json({ message: "Failed to save quiz" });
  }
}

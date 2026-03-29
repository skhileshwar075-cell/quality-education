import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Subject } from "../models/Subject.js";
import { Content } from "../models/Content.js";
import { Quiz } from "../models/Quiz.js";

async function seed() {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Create admin user
  const adminExists = await User.findOne({ email: "admin@edubridge.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@edubridge.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("Admin created: admin@edubridge.com / Admin@123");
  } else {
    console.log("Admin already exists");
  }

  // Create sample subjects
  let mathSubject = await Subject.findOne({ title: "Mathematics" });
  if (!mathSubject) {
    mathSubject = await Subject.create({
      title: "Mathematics",
      description: "Algebra, geometry, calculus and more",
    });
    console.log("Created Mathematics subject");
  }

  let sciSubject = await Subject.findOne({ title: "Science" });
  if (!sciSubject) {
    sciSubject = await Subject.create({
      title: "Science",
      description: "Physics, Chemistry, and Biology fundamentals",
    });
    console.log("Created Science subject");
  }

  // Create sample content
  const existingContent = await Content.findOne({ subjectId: mathSubject._id });
  if (!existingContent) {
    await Content.create({
      subjectId: mathSubject._id,
      title: "Introduction to Algebra",
      notes: "Algebra is the branch of mathematics dealing with symbols and the rules for manipulating those symbols. Variables represent numbers without fixed values. Basic operations: addition, subtraction, multiplication, and division can all be applied to algebraic expressions.",
      videoUrl: "https://www.youtube.com/watch?v=NybHckSEQBI",
    });
    await Content.create({
      subjectId: mathSubject._id,
      title: "Linear Equations",
      notes: "A linear equation is an algebraic equation in which each term is either a constant or the product of a constant and a single variable. For example: 2x + 3 = 7. Solving: subtract 3 from both sides → 2x = 4, divide by 2 → x = 2.",
      videoUrl: "",
    });
    console.log("Created Mathematics content");
  }

  // Create sample quiz
  const existingQuiz = await Quiz.findOne({ subjectId: mathSubject._id });
  if (!existingQuiz) {
    await Quiz.create({
      subjectId: mathSubject._id,
      questions: [
        {
          id: "q1",
          question: "What is 2x + 3 = 7? Find x.",
          options: ["x = 1", "x = 2", "x = 3", "x = 4"],
          correctAnswer: 1,
        },
        {
          id: "q2",
          question: "Which of these is a linear equation?",
          options: ["x² + 2 = 0", "2x + 3 = 7", "x³ - 1 = 0", "√x = 4"],
          correctAnswer: 1,
        },
        {
          id: "q3",
          question: "What does a variable represent in algebra?",
          options: ["A fixed number", "An unknown number", "A symbol only", "A negative number"],
          correctAnswer: 1,
        },
      ],
    });
    console.log("Created Mathematics quiz");
  }

  console.log("\n✅ Seed complete!");
  console.log("Admin login: admin@edubridge.com / Admin@123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

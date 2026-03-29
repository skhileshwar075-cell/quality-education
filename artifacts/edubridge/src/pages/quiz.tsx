import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link, useParams, useLocation } from "wouter";
import { useGetQuiz, useSubmitQuiz } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [, setLocation] = useLocation();

  const { data: quiz, isLoading } = useGetQuiz(subjectId, {
    query: { enabled: !!subjectId, retry: false }
  });

  const submitMutation = useSubmitQuiz();
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ score: 0, total: 0, percentage: 0 });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">No quiz available</h2>
          <p className="text-slate-600 mb-6">The administrator hasn't added any questions for this subject yet.</p>
          <Link href={`/subject/${subjectId}`}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    // Collect answers in order of questions
    const answerArray = quiz.questions.map(q => answers[q.id] ?? -1);
    
    // Check if all answered
    if (answerArray.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    submitMutation.mutate({
      data: {
        subjectId,
        answers: answerArray
      }
    }, {
      onSuccess: (result) => {
        setScore(result);
        setShowResult(true);
      }
    });
  };

  return (
    <Layout>
      <div className="mb-8">
        <Link href={`/subject/${subjectId}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel Quiz
        </Link>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Knowledge Check</h1>
          <p className="text-slate-600">Answer {quiz.questions.length} questions to test your understanding.</p>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((q, idx) => (
            <Card key={q.id} className="overflow-hidden">
              <div className="bg-slate-50 border-b px-6 py-4 flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {idx + 1}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">{q.question}</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={cn(
                          "w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isSelected 
                            ? "border-primary bg-primary/5 text-primary-foreground font-medium" 
                            : "border-slate-200 hover:border-primary/40 hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            isSelected ? "border-primary" : "border-slate-300"
                          )}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          {opt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-12 h-14 text-lg rounded-xl shadow-lg"
            onClick={handleSubmit}
            isLoading={submitMutation.isPending}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      <Dialog open={showResult} onOpenChange={(open) => !open && setLocation("/progress")}>
        <div className="text-center py-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Quiz Completed!</h2>
          <p className="text-slate-600 mb-8">You have successfully submitted your answers.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border">
            <div className="text-5xl font-display font-bold text-primary mb-2">
              {score.percentage}%
            </div>
            <div className="text-slate-600 font-medium">
              You scored {score.score} out of {score.total} questions correct.
            </div>
          </div>

          <Link href="/progress">
            <Button size="lg" className="w-full rounded-xl">View Progress Dashboard</Button>
          </Link>
        </div>
      </Dialog>
    </Layout>
  );
}

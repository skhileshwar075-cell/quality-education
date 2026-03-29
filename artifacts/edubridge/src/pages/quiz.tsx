import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Link, useParams, useLocation } from "wouter";
import { useGetQuiz, useSubmitQuiz } from "@workspace/api-client-react";
import { Dialog } from "@/components/ui/dialog";
import {
  ArrowLeft, CheckCircle2, AlertCircle, BrainCircuit,
  CheckCircle, XCircle, ChevronRight, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Score Ring ─────────────────────────────────────────────────────────────── */
function ScoreRing({ pct }: { pct: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const label = pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good Job! 👍" : "Keep Practicing 💪";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10"/>
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{pct}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─── Quiz Page ──────────────────────────────────────────────────────────────── */
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
  const [showReview, setShowReview] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [score, setScore] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [correctMap, setCorrectMap] = useState<Record<string, number>>({});

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const totalQuestions = quiz?.questions?.length ?? 0;
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;
  const progress = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"/>
        </div>
      </Layout>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-slate-400"/>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No Quiz Available</h2>
          <p className="text-slate-500 mb-8">The admin hasn't added any questions for this subject yet. Check back later!</p>
          <Link href={`/subject/${subjectId}`}>
            <button className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              <ArrowLeft className="h-4 w-4"/> Go Back
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setSubmitError("");
  };

  const handleSubmit = () => {
    const answerArray = quiz.questions.map(q => answers[q.id] ?? -1);
    if (answerArray.includes(-1)) {
      const unanswered = quiz.questions.filter(q => answers[q.id] === undefined).length;
      setSubmitError(`Please answer all questions. You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}.`);
      // Scroll to first unanswered
      const firstUnanswered = quiz.questions.find(q => answers[q.id] === undefined);
      if (firstUnanswered) {
        document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    submitMutation.mutate({ data: { subjectId, answers: answerArray } }, {
      onSuccess: (result) => {
        setScore(result);
        // Build a map of questionId → correctAnswerIndex for review
        const cMap: Record<string, number> = {};
        quiz.questions.forEach(q => { cMap[q.id] = q.correctAnswer; });
        setCorrectMap(cMap);
        setShowResult(true);
      },
      onError: () => setSubmitError("Failed to submit quiz. Please try again."),
    });
  };

  return (
    <Layout>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/subject/${subjectId}`}>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="h-4 w-4"/> Cancel Quiz
          </button>
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BrainCircuit className="h-4 w-4 text-indigo-600"/>
          Knowledge Check
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        {/* ── Progress Banner ── */}
        <div data-testid="quiz-progress-banner" className="bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span data-testid="quiz-answered-count" className="text-sm font-semibold text-slate-700">
              {answeredCount} of {totalQuestions} answered
            </span>
            <span className={`text-sm font-bold ${allAnswered ? "text-green-600" : "text-indigo-600"}`}>
              {allAnswered ? "✓ Ready to submit!" : `${progress}%`}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${allAnswered ? "bg-green-500" : "bg-indigo-600"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{totalQuestions} questions • Answer all before submitting</p>
        </div>

        {/* ── Questions ── */}
        <div className="space-y-6">
          {quiz.questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <motion.div
                key={q.id}
                id={`q-${q.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-200 ${
                  isAnswered ? "border-indigo-200" : "border-slate-100"
                }`}
              >
                {/* Question header */}
                <div className={`px-6 py-4 flex items-start gap-4 border-b transition-colors ${isAnswered ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-100"}`}>
                  <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    isAnswered ? "bg-indigo-600 text-white" : "bg-white border-2 border-slate-200 text-slate-500"
                  }`}>
                    {isAnswered ? <CheckCircle2 className="h-4 w-4"/> : idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900 mt-0.5 leading-relaxed">{q.question}</h3>
                </div>

                {/* Options */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={cn(
                          "w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-sm font-medium",
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                            isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
                          )}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                          </div>
                          {opt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Submit ── */}
        <div className="mt-10 space-y-4">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0"/>
              {submitError}
            </motion.div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3",
              allAnswered
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            )}
          >
            {submitMutation.isPending ? (
              <><div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"/> Submitting...</>
            ) : (
              <><BrainCircuit className="h-5 w-5"/> Submit Quiz</>
            )}
          </button>
          {!allAnswered && (
            <p className="text-center text-sm text-slate-400">{totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? "s" : ""} remaining</p>
          )}
        </div>
      </div>

      {/* ── Result Dialog ── */}
      <Dialog open={showResult} onOpenChange={(open) => { if (!open) setLocation("/progress"); }}>
        <div className="text-center py-4">
          {score && (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <ScoreRing pct={score.percentage}/>
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-1">Quiz Completed!</h2>
              <p className="text-slate-500 text-sm mb-5">
                You scored <strong className="text-slate-900">{score.score}</strong> out of <strong className="text-slate-900">{score.total}</strong> questions correctly.
              </p>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Score", value: `${score.score}/${score.total}`, color: "text-indigo-600 bg-indigo-50" },
                  { label: "Percentage", value: `${score.percentage}%`, color: score.percentage >= 60 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50" },
                  { label: "Status", value: score.percentage >= 60 ? "Passed" : "Failed", color: score.percentage >= 60 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50" },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                    <p className="text-xs opacity-70 mb-0.5">{s.label}</p>
                    <p className="font-bold">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Review answers toggle */}
              <button
                onClick={() => setShowReview(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 mb-4 transition-colors border"
              >
                <span>{showReview ? "Hide" : "Review"} Answers</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${showReview ? "rotate-90" : ""}`}/>
              </button>

              {showReview && (
                <div className="text-left space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {quiz.questions.map((q, idx) => {
                    const chosen = answers[q.id];
                    const correct = correctMap[q.id];
                    const isRight = chosen === correct;
                    return (
                      <div key={q.id} className={`rounded-xl border p-3 ${isRight ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                        <div className="flex items-start gap-2 mb-1.5">
                          {isRight
                            ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5"/>
                            : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"/>}
                          <p className="text-xs font-semibold text-slate-800">{idx + 1}. {q.question}</p>
                        </div>
                        <div className="pl-6 space-y-0.5 text-xs">
                          {!isRight && (
                            <p className="text-red-600">Your answer: <span className="font-medium">{q.options[chosen]}</span></p>
                          )}
                          <p className="text-green-700">Correct: <span className="font-medium">{q.options[correct]}</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/dashboard" className="flex-1">
                  <button className="w-full py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold transition-colors text-sm">
                    Back to Subjects
                  </button>
                </Link>
                <Link href="/progress" className="flex-1">
                  <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors text-sm flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4"/> View Progress
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </Layout>
  );
}

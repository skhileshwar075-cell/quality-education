import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, PlayCircle, FileText, BrainCircuit, BookOpen,
  CheckCircle2, AlertCircle, CheckCircle, XCircle,
  TrendingUp, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOKEN_KEY = "edubridge_token";
function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(url, {
    ...opts,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
}

/* ─── Score Ring ─────────────────────────────────────────────────────────────── */
function ScoreRing({ pct }: { pct: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const label = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : "Keep Practicing";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-900">{pct}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─── Inline Topic Quiz ──────────────────────────────────────────────────────── */
function TopicQuiz({ topicId, subjectId }: { topicId: string; subjectId: string }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/quiz/topic/${topicId}`);
      if (!res.ok) throw new Error("No quiz available");
      const data = await res.json();
      setQuiz(data);
      setStarted(true);
    } catch {
      setError("No quiz available for this topic yet.");
    } finally {
      setLoading(false);
    }
  };

  const answered = Object.keys(answers).length;
  const total = quiz?.questions?.length ?? 0;
  const allDone = answered === total && total > 0;

  const handleSubmit = async () => {
    if (!allDone) { setError(`Answer all ${total} questions first.`); return; }
    setSubmitting(true); setError("");
    const answerArr = quiz.questions.map((q: any) => answers[q.id] ?? -1);
    try {
      const res = await authFetch("/api/quiz/topic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, answers: answerArr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <BrainCircuit className="h-8 w-8 text-indigo-600"/>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Topic Quiz</h3>
        <p className="text-slate-500 text-sm mb-6">Test your understanding of this topic with a quick quiz.</p>
        {error ? (
          <div className="bg-slate-50 rounded-xl p-4 text-slate-500 text-sm border">{error}</div>
        ) : (
          <button
            onClick={startQuiz}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <BrainCircuit className="h-4 w-4"/>}
            {loading ? "Loading…" : "Start Quiz"}
          </button>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Or <Link href={`/quiz/${subjectId}`} className="text-indigo-600 hover:underline">take the full subject quiz</Link>
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Quiz Result</h3>
        <div className="flex flex-col items-center gap-4 mb-6">
          <ScoreRing pct={result.percentage}/>
          <p className="text-slate-600 text-sm">
            You scored <strong>{result.score}</strong> out of <strong>{result.total}</strong>
          </p>
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
              { l: "Score", v: `${result.score}/${result.total}`, c: "bg-indigo-50 text-indigo-700" },
              { l: "Percentage", v: `${result.percentage}%`, c: result.percentage >= 60 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700" },
              { l: "Status", v: result.percentage >= 60 ? "Passed" : "Failed", c: result.percentage >= 60 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700" },
            ].map(s => (
              <div key={s.l} className={`rounded-xl p-3 ${s.c} text-center`}>
                <p className="text-xs opacity-70">{s.l}</p>
                <p className="font-bold text-sm">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Review */}
        <button
          onClick={() => setShowReview(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 mb-4 transition-colors border"
        >
          <span>{showReview ? "Hide" : "Review"} Answers</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${showReview ? "rotate-90" : ""}`}/>
        </button>

        {showReview && (
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {quiz.questions.map((q: any, i: number) => {
              const chosen = answers[q.id];
              const correct = q.correctAnswer;
              const isRight = chosen === correct;
              return (
                <div key={q.id} className={`rounded-xl border p-3 text-sm ${isRight ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-start gap-2 mb-1">
                    {isRight ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0"/> : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0"/>}
                    <p className="font-semibold text-slate-800">{i + 1}. {q.question}</p>
                  </div>
                  <div className="pl-6 text-xs space-y-0.5">
                    {!isRight && <p className="text-red-600">Your answer: <span className="font-medium">{q.options[chosen]}</span></p>}
                    <p className="text-green-700">Correct: <span className="font-medium">{q.options[correct]}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setResult(null); setAnswers({}); setShowReview(false); }}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 transition-colors"
          >
            Retry Quiz
          </button>
          <Link href="/progress" className="flex-1">
            <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4"/> My Progress
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const progress = total ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5"/> Topic Quiz
          </h3>
          <span className="text-sm font-semibold text-indigo-700">{answered}/{total} answered</span>
        </div>
        <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${allDone ? "bg-green-500" : "bg-indigo-600"}`}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}/>
        </div>
        {quiz.isTopicSpecific === false && (
          <p className="text-xs text-indigo-500 mt-2">Showing subject-wide questions (no topic-specific questions yet)</p>
        )}
      </div>

      <div className="p-6 space-y-5">
        {quiz.questions.map((q: any, idx: number) => {
          const isAnswered = answers[q.id] !== undefined;
          return (
            <div key={q.id} className={`rounded-xl border-2 overflow-hidden transition-all ${isAnswered ? "border-indigo-200" : "border-slate-100"}`}>
              <div className={`px-4 py-3 flex items-start gap-3 text-sm font-semibold ${isAnswered ? "bg-indigo-50 text-indigo-900 border-b border-indigo-100" : "bg-slate-50 text-slate-800 border-b border-slate-100"}`}>
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isAnswered ? "bg-indigo-600 text-white" : "bg-white border-2 border-slate-300 text-slate-500"}`}>
                  {isAnswered ? <CheckCircle2 className="h-3.5 w-3.5"/> : idx + 1}
                </span>
                {q.question}
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt: string, oi: number) => {
                  const sel = answers[q.id] === oi;
                  return (
                    <button key={oi} onClick={() => { setAnswers(p => ({ ...p, [q.id]: oi })); setError(""); }}
                      className={cn("w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                        sel ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                      )}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex-shrink-0", sel ? "border-indigo-500 bg-indigo-500" : "border-slate-300")}>
                          {sel && <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto"/>}
                        </div>
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 pb-6 space-y-3">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0"/>{error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || !allDone}
          className={cn("w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
            allDone ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {submitting ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Submitting…</> : <><BrainCircuit className="h-4 w-4"/>Submit Quiz</>}
        </button>
        {!allDone && <p className="text-center text-xs text-slate-400">{total - answered} question{total - answered !== 1 ? "s" : ""} remaining</p>}
      </div>
    </div>
  );
}

/* ─── Topic Page ─────────────────────────────────────────────────────────────── */
export default function TopicPage() {
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    if (!topicId) return;
    setLoading(true);
    authFetch(`/api/content/item/${topicId}`)
      .then(r => r.json())
      .then(async (data) => {
        setTopic(data);
        const subRes = await authFetch(`/api/subjects/${data.subjectId}`);
        if (subRes.ok) setSubject(await subRes.json());
      })
      .catch(() => setTopic(null))
      .finally(() => setLoading(false));
  }, [topicId]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-5 w-40 bg-slate-200 rounded"/>
          <div className="h-10 w-72 bg-slate-200 rounded"/>
          <div className="h-48 bg-slate-200 rounded-2xl"/>
          <div className="h-64 bg-slate-200 rounded-2xl"/>
        </div>
      </Layout>
    );
  }

  if (!topic) {
    return (
      <Layout>
        <div className="text-center py-20">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4"/>
          <h2 className="text-xl font-bold text-slate-700">Topic not found</h2>
          <Link href="/dashboard">
            <button className="mt-4 bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl">Back to Dashboard</button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Subjects</Link>
          <ChevronRight className="h-3.5 w-3.5"/>
          {subject && (
            <>
              <Link href={`/subject/${topic.subjectId}`} className="hover:text-indigo-600 transition-colors">{subject.title}</Link>
              <ChevronRight className="h-3.5 w-3.5"/>
            </>
          )}
          <span className="text-slate-700 font-medium truncate">{topic.title}</span>
        </nav>

        {/* Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white mb-8 shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-7 w-7 text-white"/>
            </div>
            <div className="min-w-0">
              {subject && (
                <p className="text-indigo-200 text-sm font-medium mb-1">{subject.title}</p>
              )}
              <h1 className="text-3xl font-bold leading-tight mb-2">{topic.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  <BookOpen className="h-3 w-3"/> Study Material
                </span>
                {topic.videoUrl && (
                  <span className="inline-flex items-center gap-1 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                    <PlayCircle className="h-3 w-3"/> Video Included
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  <BrainCircuit className="h-3 w-3"/> Quiz Available
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Video */}
          {topic.videoUrl && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-indigo-600"/>
                  <h2 className="font-bold text-slate-900">Video Lesson</h2>
                </div>
                <div className="aspect-video bg-slate-900 relative flex items-center justify-center group cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&fit=crop"
                    alt="Video lesson"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"/>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <PlayCircle className="h-20 w-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"/>
                    <span className="text-white font-medium text-sm bg-black/30 px-4 py-1.5 rounded-full">{topic.title}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Study Notes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600"/>
                <h2 className="font-bold text-slate-900">Study Notes</h2>
              </div>
              <div className="px-6 py-6">
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {topic.notes}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Topic Quiz */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-slate-200"/>
              <span className="text-sm font-semibold text-slate-500 px-3">Test Your Knowledge</span>
              <div className="flex-1 h-px bg-slate-200"/>
            </div>
            <TopicQuiz topicId={topicId} subjectId={topic.subjectId}/>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

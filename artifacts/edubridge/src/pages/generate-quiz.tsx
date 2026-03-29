import { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Cpu, CheckCircle, Save, RefreshCw, AlertCircle, Sparkles, Zap, Brain, Target } from "lucide-react";
import { useGetSubjects } from "@workspace/api-client-react";

const TOKEN_KEY = "edubridge_token";
function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

const DIFFICULTIES = [
  { value: "easy", label: "Easy", desc: "Basic recall questions", icon: Zap, color: "bg-green-50 border-green-300 text-green-700" },
  { value: "medium", label: "Medium", desc: "Conceptual understanding", icon: Brain, color: "bg-amber-50 border-amber-300 text-amber-700" },
  { value: "hard", label: "Hard", desc: "Advanced application", icon: Target, color: "bg-red-50 border-red-300 text-red-700" },
];

export default function GenerateQuizPage() {
  const { data: subjects } = useGetSubjects();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(5);
  const [subjectId, setSubjectId] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedSubject = subjects?.find(s => s.id === subjectId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) { setError("Please select a subject first"); return; }
    setGenerating(true); setError(""); setSaved(false);
    try {
      const subjectName = subjects?.find(s => s.id === subjectId)?.title || "General";
      const res = await fetch("/api/admin/ai-quiz/generate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ subject: subjectName, topic, difficulty, numberOfQuestions: count }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Generation failed");
      setQuestions(json.questions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!subjectId) { setError("Please select a subject"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/ai-quiz/save", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ subjectId, questions }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Save failed");
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (qi: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const opts = [...q.options];
      opts[oi] = value;
      return { ...q, options: opts };
    }));
  };

  const removeQuestion = (qi: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== qi));
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard">
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
            <ArrowLeft className="h-5 w-5"/>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-indigo-600"/> AI Quiz Generator
          </h1>
          <p className="text-slate-500 mt-1">Generate MCQ questions automatically based on subject, topic, and difficulty</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Generate Form */}
        <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500"/> Configure Quiz
          </h2>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
            <select
              required
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            >
              <option value="">Select a subject</option>
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Topic *</label>
            <Input
              required
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={selectedSubject ? `e.g. ${selectedSubject.title} basics` : "e.g. Algebra, World War II, Photosynthesis"}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(d => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      difficulty === d.value ? d.color : "border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5"/>
                    <span>{d.label}</span>
                    <span className="text-xs opacity-60 font-normal">{d.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Number of Questions: <span className="text-indigo-600">{count}</span>
            </label>
            <input
              type="range" min={1} max={10} value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span><span>5</span><span>10</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0"/>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating ? (
              <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> Generating {count} questions...</>
            ) : (
              <><Sparkles className="h-4 w-4"/> Generate {count} Questions</>
            )}
          </button>
        </form>

        {/* Generated Questions */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600"/>
                {questions.length} Questions Generated
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                  {difficulty} · {selectedSubject?.title}
                </span>
              </h2>
              <button onClick={() => setQuestions([])} className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
                <RefreshCw className="h-3 w-3"/> Clear
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-indigo-100 text-indigo-700 font-bold rounded-full h-7 w-7 flex items-center justify-center text-sm flex-shrink-0">{qi + 1}</span>
                  <textarea
                    className="flex-1 min-h-[60px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition"
                    value={q.question}
                    onChange={e => updateQuestion(qi, "question", e.target.value)}
                    placeholder="Question text…"
                  />
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="text-slate-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    title="Remove question"
                  >✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                  {q.options.map((opt: string, oi: number) => (
                    <div key={oi} className={`flex gap-2 items-center rounded-xl border p-2 transition-colors ${q.correctAnswer === oi ? "border-green-300 bg-green-50" : "border-slate-200"}`}>
                      <button
                        type="button"
                        onClick={() => updateQuestion(qi, "correctAnswer", oi)}
                        className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          q.correctAnswer === oi ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-green-400"
                        }`}
                        title="Mark as correct"
                      >
                        {q.correctAnswer === oi && <CheckCircle className="h-3.5 w-3.5 text-white"/>}
                      </button>
                      <input
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        className="flex-1 text-sm bg-transparent border-none outline-none text-slate-700"
                        placeholder={`Option ${oi + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Save section */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Save className="h-4 w-4"/> Save to Database</h3>
              {saved ? (
                <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl p-4 border border-green-200">
                  <CheckCircle className="h-5 w-5"/>
                  <div>
                    <p className="font-semibold">Saved successfully!</p>
                    <p className="text-sm opacity-80">{questions.length} questions added to <strong>{selectedSubject?.title}</strong></p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Saving to:</span>
                    <span className="font-semibold text-indigo-600">{selectedSubject?.title || "Select a subject above"}</span>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      <AlertCircle className="h-4 w-4"/> {error}
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || !subjectId}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> Saving...</>
                    ) : (
                      <><Save className="h-4 w-4"/> Save {questions.length} Questions</>
                    )}
                  </button>
                </>
              )}
              {saved && (
                <div className="flex gap-3">
                  <button onClick={() => { setQuestions([]); setSaved(false); setTopic(""); }} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 transition-colors">
                    Generate More
                  </button>
                  <Link href="/admin/dashboard" className="flex-1">
                    <button className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 transition-colors">
                      Back to Dashboard
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

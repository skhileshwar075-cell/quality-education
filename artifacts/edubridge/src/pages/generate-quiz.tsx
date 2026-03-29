import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Cpu, CheckCircle, Save, RefreshCw } from "lucide-react";
import { useGetSubjects } from "@workspace/api-client-react";

const TOKEN_KEY = "edubridge_token";
function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export default function GenerateQuizPage() {
  const { data: subjects } = useGetSubjects();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [subjectId, setSubjectId] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/ai-quiz/generate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ subject, topic, numberOfQuestions: count }),
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
    if (!subjectId) { setError("Please select a subject to save to"); return; }
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

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5"/></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary"/> AI Quiz Generator
          </h1>
          <p className="text-slate-600 mt-1">Generate MCQ questions automatically based on subject and topic</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Generate Form */}
        <form onSubmit={handleGenerate} className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Generate Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject Name</label>
              <Input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <Input required value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Algebra" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Questions (1–10)</label>
            <Input type="number" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))} />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <Button type="submit" isLoading={generating} className="gap-2">
            <Cpu className="h-4 w-4"/> Generate Quiz
          </Button>
        </form>

        {/* Generated Questions Preview */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">{questions.length} Questions Generated — Edit if needed</h2>
              <Button variant="outline" size="sm" onClick={() => setQuestions([])} className="gap-2">
                <RefreshCw className="h-4 w-4"/> Clear
              </Button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="bg-white rounded-2xl border p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary font-bold rounded-full h-7 w-7 flex items-center justify-center text-sm flex-shrink-0">{qi + 1}</span>
                  <textarea
                    className="flex-1 min-h-[60px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
                    value={q.question}
                    onChange={e => updateQuestion(qi, "question", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                  {q.options.map((opt: string, oi: number) => (
                    <div key={oi} className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => updateQuestion(qi, "correctAnswer", oi)}
                        className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correctAnswer === oi ? "bg-green-500 border-green-500" : "border-slate-300 hover:border-green-400"}`}
                        title="Mark as correct"
                      >
                        {q.correctAnswer === oi && <CheckCircle className="h-4 w-4 text-white fill-white"/>}
                      </button>
                      <Input
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        className={q.correctAnswer === oi ? "border-green-400 bg-green-50" : ""}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Save to Subject */}
            <div className="bg-slate-50 rounded-2xl border p-5 space-y-4">
              <h3 className="font-semibold text-slate-900">Save to Database</h3>
              {saved ? (
                <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl p-4">
                  <CheckCircle className="h-5 w-5"/>
                  <div>
                    <p className="font-medium">Quiz saved successfully!</p>
                    <p className="text-sm">Questions have been added to the subject's quiz bank.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Save to Subject</label>
                    <select
                      value={subjectId}
                      onChange={e => setSubjectId(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <option value="">Select a subject</option>
                      {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
                  <Button onClick={handleSave} isLoading={saving} className="gap-2">
                    <Save className="h-4 w-4"/> Save Quiz
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

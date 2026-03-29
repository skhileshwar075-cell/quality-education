import { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useGetMyResults, useGetSubjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Trophy, Target, TrendingUp, History, Star, BookOpen, BarChart2, ArrowLeft, Filter } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";

/* ─── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3.5 rounded-2xl ${bg} flex-shrink-0`}>
        <div className={color}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Score Badge ────────────────────────────────────────────────────────────── */
function ScoreBadge({ pct }: { pct: number }) {
  const cls = pct >= 80
    ? "bg-green-100 text-green-700 border-green-200"
    : pct >= 60
    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${cls}`}>{pct}%</span>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-900 mb-1">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value}%</p>
    </div>
  );
}

/* ─── Progress Page ──────────────────────────────────────────────────────────── */
export default function ProgressPage() {
  const { data: results, isLoading } = useGetMyResults();
  const { data: subjects } = useGetSubjects();
  const [filterSubject, setFilterSubject] = useState("all");

  const stats = useMemo(() => {
    if (!results || results.length === 0)
      return { total: 0, avg: 0, best: 0, subjectsTried: 0, passing: 0 };
    const avg = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);
    const best = Math.max(...results.map(r => r.percentage));
    const subjectsTried = new Set(results.map(r => r.subjectId)).size;
    const passing = results.filter(r => r.percentage >= 60).length;
    return { total: results.length, avg, best, subjectsTried, passing };
  }, [results]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return [...results]
      .reverse()
      .slice(-12)
      .map((r, i) => ({
        name: `#${i + 1} ${r.subjectTitle}`,
        short: r.subjectTitle.slice(0, 8),
        score: r.percentage,
      }));
  }, [results]);

  const filtered = useMemo(() => {
    if (!results) return [];
    if (filterSubject === "all") return results;
    return results.filter(r => r.subjectId === filterSubject);
  }, [results, filterSubject]);

  const subjectOptions = useMemo(() => {
    const seen = new Set<string>();
    return (results || []).filter(r => { const k = !seen.has(r.subjectId); seen.add(r.subjectId); return k; });
  }, [results]);

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Link href="/dashboard">
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
            <ArrowLeft className="h-5 w-5"/>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-indigo-600"/> Your Progress
          </h1>
          <p className="text-slate-500 mt-0.5">Track your learning journey and quiz performance</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Target className="h-6 w-6"/>} label="Quizzes Taken" value={stats.total}
          color="text-indigo-600" bg="bg-indigo-50" sub="total attempts"/>
        <StatCard icon={<BarChart2 className="h-6 w-6"/>} label="Average Score" value={stats.total ? `${stats.avg}%` : "—"}
          color="text-violet-600" bg="bg-violet-50" sub="across all quizzes"/>
        <StatCard icon={<Trophy className="h-6 w-6"/>} label="Best Score" value={stats.total ? `${stats.best}%` : "—"}
          color="text-amber-600" bg="bg-amber-50" sub="personal record"/>
        <StatCard icon={<BookOpen className="h-6 w-6"/>} label="Subjects Tried" value={`${stats.subjectsTried} / ${subjects?.length || 0}`}
          color="text-emerald-600" bg="bg-emerald-50" sub="subjects explored"/>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-8">
          {/* Score Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600"/> Score Trend
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-4 bg-green-400 rounded inline-block"/> Passing (≥60%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-4 bg-indigo-500 rounded inline-block"/> Your score</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="short" tick={{ fontSize: 11 }} stroke="#94a3b8"/>
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${v}%`}/>
                <ReferenceLine y={60} stroke="#4ade80" strokeDasharray="4 4" label={{ value: "Pass", position: "right", fontSize: 10, fill: "#4ade80" }}/>
                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Good", position: "right", fontSize: 10, fill: "#f59e0b" }}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line
                  type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Quizzes Passed", value: stats.passing, total: stats.total, color: "text-green-600", bg: "bg-green-50", icon: "✅" },
              { label: "Quizzes Failed", value: stats.total - stats.passing, total: stats.total, color: "text-red-600", bg: "bg-red-50", icon: "❌" },
              { label: "Pass Rate", value: `${stats.total ? Math.round((stats.passing / stats.total) * 100) : 0}%`, total: null, color: "text-indigo-600", bg: "bg-indigo-50", icon: "📈" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl ${s.bg} p-5 flex items-center gap-4`}>
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <p className="text-sm text-slate-600">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>
                    {s.value}{s.total !== null && <span className="text-sm font-normal text-slate-400 ml-1">/ {s.total}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400"/> Quiz History
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400"/>
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="all">All Subjects</option>
                  {subjectOptions.map(r => (
                    <option key={r.subjectId} value={r.subjectId}>{r.subjectTitle}</option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Score</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(result => (
                  <tr key={result.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Star className="h-4 w-4 text-indigo-600"/>
                        </div>
                        <span className="font-medium text-slate-900">{result.subjectTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                      {new Date(result.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                      {result.score} / {result.total}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ScoreBadge pct={result.percentage}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400">No results match the selected filter.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">
          <Trophy className="h-16 w-16 text-slate-200 mx-auto mb-4"/>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Quiz Attempts Yet</h3>
          <p className="text-slate-400 mb-6">Complete your first quiz to start tracking your progress</p>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
              <BookOpen className="h-4 w-4"/> Browse Subjects
            </button>
          </Link>
        </div>
      )}
    </Layout>
  );
}

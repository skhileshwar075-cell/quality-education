import { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useGetSubjects, useGetMyResults } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  BookOpen, ChevronRight, GraduationCap, Trophy, Target,
  TrendingUp, Clock, BarChart2, ArrowRight, Flame, Star,
  Search, X
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, gradient, loading }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; gradient: string; loading?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg`}>
      <div className="absolute top-0 right-0 p-5 opacity-20">{icon}</div>
      {loading ? (
        <div className="space-y-3">
          <div className="h-3 w-20 bg-white/30 rounded animate-pulse"/>
          <div className="h-8 w-16 bg-white/30 rounded animate-pulse"/>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-white/70 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
        </>
      )}
    </div>
  );
}

/* ─── Subject Card (Category Card) ──────────────────────────────────────────── */
const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-purple-500 to-fuchsia-500",
];
const ICONS = ["📐", "🔬", "📚", "🌍", "⚗️", "🧮"];

function SubjectCard({ subject, idx, attempted }: { subject: any; idx: number; attempted: boolean }) {
  const grad = GRADIENTS[idx % GRADIENTS.length];
  const emoji = ICONS[idx % ICONS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <Link href={`/subject/${subject.id}`} className="block h-full">
        <div className="group h-full bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className={`h-1.5 bg-gradient-to-r ${grad}`}/>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {emoji}
              </div>
              {attempted && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  <Star className="h-3 w-3 fill-current"/> Attempted
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">{subject.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{subject.description}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore topics <ArrowRight className="h-3 w-3"/>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Recent Activity Item ───────────────────────────────────────────────────── */
function RecentItem({ result }: { result: any }) {
  const pct = result.percentage;
  const color = pct >= 80 ? "text-green-600 bg-green-50 border-green-200"
    : pct >= 60 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-red-600 bg-red-50 border-red-200";
  return (
    <Link href={`/quiz/${result.subjectId}`}>
      <div className="flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="h-4 w-4 text-indigo-600"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">{result.subjectTitle}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3"/>
              {new Date(result.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${color}`}>{pct}%</div>
      </div>
    </Link>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjects();
  const { data: results, isLoading: resultsLoading } = useGetMyResults();
  const [search, setSearch] = useState("");

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avg: 0, best: 0, subjects: 0 };
    const avg = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);
    const best = Math.max(...results.map(r => r.percentage));
    const uniqueSubjects = new Set(results.map(r => r.subjectId)).size;
    return { total: results.length, avg, best, subjects: uniqueSubjects };
  }, [results]);

  const attemptedSubjectIds = useMemo(
    () => new Set((results || []).map(r => r.subjectId)),
    [results]
  );

  const filtered = useMemo(() => {
    if (!subjects) return [];
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(s =>
      s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  const recentResults = (results || []).slice(0, 4);

  return (
    <Layout>
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-8 mb-8 text-white shadow-xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"/>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"/>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-3xl sm:text-4xl font-bold">{user?.name || "Learner"}</h1>
            <p className="text-indigo-200 mt-2">Pick a subject below to explore its topics and quizzes.</p>
          </div>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <Flame className="h-5 w-5 text-orange-300"/>
              <div>
                <p className="text-xs text-indigo-200">Quiz attempts</p>
                <p className="font-bold">{stats.total} total</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Target className="h-10 w-10"/>} label="Quizzes Attempted" value={stats.total}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" loading={resultsLoading}/>
        <StatCard icon={<BarChart2 className="h-10 w-10"/>} label="Average Score" value={stats.total ? `${stats.avg}%` : "—"}
          sub="across all attempts" gradient="bg-gradient-to-br from-violet-500 to-violet-700" loading={resultsLoading}/>
        <StatCard icon={<Trophy className="h-10 w-10"/>} label="Best Score" value={stats.total ? `${stats.best}%` : "—"}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500" loading={resultsLoading}/>
        <StatCard icon={<TrendingUp className="h-10 w-10"/>} label="Subjects Explored"
          value={`${stats.subjects} / ${subjects?.length || 0}`}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600" loading={resultsLoading || subjectsLoading}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Subjects / Category Cards ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600"/> Browse Subjects
            </h2>
            <span className="text-sm text-slate-400">{subjects?.length || 0} subjects</span>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects…"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="h-3.5 w-3.5 text-slate-400"/>
              </button>
            )}
          </div>

          {subjectsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse"/>)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((subject, idx) => (
                <SubjectCard key={subject.id} subject={subject} idx={idx} attempted={attemptedSubjectIds.has(subject.id)}/>
              ))}
            </div>
          ) : search ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed">
              <Search className="h-10 w-10 text-slate-200 mx-auto mb-3"/>
              <p className="font-semibold text-slate-600">No subjects match "{search}"</p>
              <button onClick={() => setSearch("")} className="mt-2 text-sm text-indigo-600 hover:underline">Clear search</button>
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border-2 border-dashed text-slate-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40"/>
              <p>No subjects available yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* ── Sidebar: Recent Activity ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600"/> Recent Activity
              </h2>
              {recentResults.length > 0 && (
                <Link href="/progress" className="text-xs text-indigo-600 hover:underline font-medium">View all</Link>
              )}
            </div>
            {resultsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : recentResults.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentResults.map(r => <RecentItem key={r.id} result={r}/>)}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-40"/>
                No quiz attempts yet.<br/>
                <span className="text-indigo-600 font-medium">Click a subject to get started →</span>
              </div>
            )}
          </div>

          {/* Performance quick card */}
          {stats.total > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-400"/> Performance</h3>
              <div className="space-y-3">
                {[
                  { label: "Passing rate", value: `${Math.round(((results || []).filter(r => r.percentage >= 60).length / stats.total) * 100)}%`, color: "bg-green-500" },
                  { label: "Avg score", value: `${stats.avg}%`, color: "bg-indigo-500" },
                  { label: "Best score", value: `${stats.best}%`, color: "bg-amber-400" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{s.label}</span><span className="text-white font-medium">{s.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: s.value }}/>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/progress">
                <button className="mt-4 w-full text-xs font-semibold text-slate-300 hover:text-white border border-white/20 hover:border-white/40 py-2 rounded-xl transition-colors flex items-center justify-center gap-1">
                  Full Progress Report <ChevronRight className="h-3 w-3"/>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

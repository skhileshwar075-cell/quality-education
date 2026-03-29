import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetSubject, useGetContent } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, BrainCircuit, Search, PlayCircle,
  FileText, X, ChevronRight, BookMarked, Video
} from "lucide-react";

const TOPIC_COLORS = [
  { bar: "from-indigo-500 to-violet-500", icon: "bg-indigo-100 text-indigo-600" },
  { bar: "from-blue-500 to-cyan-500",     icon: "bg-blue-100 text-blue-600" },
  { bar: "from-emerald-500 to-teal-500",  icon: "bg-emerald-100 text-emerald-600" },
  { bar: "from-amber-500 to-orange-500",  icon: "bg-amber-100 text-amber-600" },
  { bar: "from-rose-500 to-pink-500",     icon: "bg-rose-100 text-rose-600" },
  { bar: "from-purple-500 to-fuchsia-500",icon: "bg-purple-100 text-purple-600" },
];

/* ─── Topic Card ─────────────────────────────────────────────────────────────── */
function TopicCard({ topic, idx }: { topic: any; idx: number }) {
  const col = TOPIC_COLORS[idx % TOPIC_COLORS.length];
  const preview = topic.notes?.replace(/\s+/g, " ").slice(0, 110) + (topic.notes?.length > 110 ? "…" : "");
  return (
    <Link href={`/topic/${topic.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
      >
        {/* Color bar */}
        <div className={`h-1.5 bg-gradient-to-r ${col.bar}`}/>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className={`h-10 w-10 rounded-xl ${col.icon} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <FileText className="h-5 w-5"/>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {topic.videoUrl && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  <Video className="h-3 w-3"/> Video
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                <BrainCircuit className="h-3 w-3"/> Quiz
              </span>
            </div>
          </div>
          <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {topic.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{preview}</p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Study this topic <ChevronRight className="h-3 w-3"/>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Subject (Topic List) Page ──────────────────────────────────────────────── */
export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.id as string;
  const [search, setSearch] = useState("");

  const { data: subject, isLoading: subjectLoading } = useGetSubject(subjectId, {
    query: { enabled: !!subjectId }
  });
  const { data: contents, isLoading: contentLoading } = useGetContent(subjectId, {
    query: { enabled: !!subjectId }
  });

  const filtered = useMemo(() => {
    if (!contents) return [];
    const q = search.trim().toLowerCase();
    if (!q) return contents;
    return contents.filter(c =>
      c.title.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q)
    );
  }, [contents, search]);

  const isLoading = subjectLoading || contentLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-40 bg-slate-200 rounded"/>
          <div className="h-40 bg-slate-200 rounded-3xl"/>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-slate-200 rounded-2xl"/>)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!subject) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Subject not found</h2>
          <Link href="/dashboard">
            <button className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl">Back to Dashboard</button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <Link href="/dashboard">
        <div className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4"/> Back to Subjects
        </div>
      </Link>

      {/* Subject Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4"/>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4"/>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white"/>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Subject</p>
              <h1 className="text-3xl font-bold">{subject.title}</h1>
              <p className="text-slate-300 text-sm mt-1 max-w-lg">{subject.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-lg font-bold">{contents?.length ?? 0}</p>
              <p className="text-xs text-slate-300">Topics</p>
            </div>
            <Link href={`/quiz/${subjectId}`}>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <BrainCircuit className="h-4 w-4"/> Full Subject Quiz
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {contents && contents.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search topics in ${subject.title}…`}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4 text-slate-400"/>
            </button>
          )}
        </div>
      )}

      {/* Topics Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-indigo-600"/>
          {search ? `Results for "${search}"` : "All Topics"}
        </h2>
        <span className="text-sm text-slate-400">{filtered.length} topic{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {contentLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((topic, idx) => (
            <TopicCard key={topic.id} topic={topic} idx={idx}/>
          ))}
        </div>
      ) : search ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
          <Search className="h-10 w-10 text-slate-200 mx-auto mb-3"/>
          <p className="font-semibold text-slate-600">No topics match "{search}"</p>
          <button onClick={() => setSearch("")} className="mt-3 text-sm text-indigo-600 hover:underline">Clear search</button>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
          <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3"/>
          <p className="font-semibold text-slate-600">No topics added yet</p>
          <p className="text-slate-400 text-sm mt-1">The admin hasn't added any study material for this subject yet.</p>
        </div>
      )}

      {/* Take Full Quiz CTA */}
      {contents && contents.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-indigo-200 text-white">
          <div>
            <h3 className="font-bold text-lg">Ready to test everything?</h3>
            <p className="text-indigo-200 text-sm">Take the full {subject.title} quiz covering all topics.</p>
          </div>
          <Link href={`/quiz/${subjectId}`}>
            <button className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              <BrainCircuit className="h-5 w-5"/> Take Full Quiz
            </button>
          </Link>
        </motion.div>
      )}
    </Layout>
  );
}

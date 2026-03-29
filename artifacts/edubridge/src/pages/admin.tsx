import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useGetSubjects, useCreateSubject, useDeleteSubject, useGetUsers, useGetAllResults, useCreateContent } from "@workspace/api-client-react";
import { useAdminContent, useAdminQuizzes, updateContent, deleteContent, deleteQuiz } from "@/hooks/use-admin-api";
import { Link } from "wouter";
import { Plus, Trash2, Settings, Users, BookOpen, FileText, BarChart2, Upload, Cpu, Edit2, X, CheckCircle, Target, TrendingUp, Brain, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

/* ─── Admin Stat Card ─────────────────────────────────────────────────────────── */
function AdminStatCard({ icon, label, value, gradient, loading }: {
  icon: React.ReactNode; label: string; value: number | string; gradient: string; loading?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg flex-1 min-w-[140px]`}>
      <div className="absolute top-0 right-0 p-5 opacity-20">{icon}</div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-20 bg-white/30 rounded animate-pulse"/>
          <div className="h-8 w-12 bg-white/30 rounded animate-pulse"/>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-white/70 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </>
      )}
    </div>
  );
}

/* ─── Admin Stats Row ─────────────────────────────────────────────────────────── */
function AdminStatsRow() {
  const { data: users, isLoading: usersLoading } = useGetUsers();
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjects();
  const { data: results, isLoading: resultsLoading } = useGetAllResults();
  const { data: content, isLoading: contentLoading } = useAdminContent();

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <AdminStatCard
        icon={<Users className="h-10 w-10"/>} label="Total Users"
        value={usersLoading ? "…" : users?.length ?? 0}
        gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
        loading={usersLoading}
      />
      <AdminStatCard
        icon={<BookOpen className="h-10 w-10"/>} label="Subjects"
        value={subjectsLoading ? "…" : subjects?.length ?? 0}
        gradient="bg-gradient-to-br from-violet-500 to-violet-700"
        loading={subjectsLoading}
      />
      <AdminStatCard
        icon={<FileText className="h-10 w-10"/>} label="Content Items"
        value={contentLoading ? "…" : content?.length ?? 0}
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        loading={contentLoading}
      />
      <AdminStatCard
        icon={<Target className="h-10 w-10"/>} label="Quiz Attempts"
        value={resultsLoading ? "…" : results?.length ?? 0}
        gradient="bg-gradient-to-br from-amber-400 to-orange-500"
        loading={resultsLoading}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Manage subjects, content, quizzes, and monitor user progress.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/analytics">
            <Button variant="outline" className="gap-2 text-sm"><BarChart2 className="h-4 w-4"/>Analytics</Button>
          </Link>
          <Link href="/admin/quiz-upload">
            <Button variant="outline" className="gap-2 text-sm"><Upload className="h-4 w-4"/>Bulk Upload</Button>
          </Link>
          <Link href="/admin/generate-quiz">
            <Button variant="outline" className="gap-2 text-sm"><Cpu className="h-4 w-4"/>AI Quiz</Button>
          </Link>
        </div>
      </div>

      <AdminStatsRow />

      <Tabs defaultValue="subjects">
        <TabsList className="mb-8 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Questions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects"><AdminSubjects /></TabsContent>
        <TabsContent value="content"><AdminContent /></TabsContent>
        <TabsContent value="quiz"><AdminQuiz /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="results"><AdminResults /></TabsContent>
      </Tabs>
    </Layout>
  );
}

/* ─── SUBJECTS ─────────────────────────────────────────────────────────────── */
function AdminSubjects() {
  const queryClient = useQueryClient();
  const { data: subjects } = useGetSubjects();
  const createMutation = useCreateSubject();
  const deleteMutation = useDeleteSubject();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { title, description } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
        setIsCreateOpen(false); setTitle(""); setDescription("");
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5"/> Subjects</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4"/> New Subject</Button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Title</th>
              <th className="px-6 py-4 font-medium text-slate-500">Description</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subjects?.map(sub => (
              <tr key={sub.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{sub.title}</td>
                <td className="px-6 py-4 text-slate-500 max-w-md truncate">{sub.description}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate({ id: sub.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }) })} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </td>
              </tr>
            ))}
            {!subjects?.length && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No subjects found</td></tr>}
          </tbody>
        </table>
      </div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Create Subject">
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/* ─── CONTENT ───────────────────────────────────────────────────────────────── */
function AdminContent() {
  const queryClient = useQueryClient();
  const { data: subjects } = useGetSubjects();
  const { data: content, loading, refetch } = useAdminContent();
  const createMutation = useCreateContent();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const openCreate = () => { setSubjectId(""); setTitle(""); setNotes(""); setVideoUrl(""); setError(""); setIsCreateOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setSubjectId(item.subjectId); setTitle(item.title); setNotes(item.notes); setVideoUrl(item.videoUrl || ""); setError(""); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    createMutation.mutate({ data: { subjectId, title, notes, videoUrl } }, {
      onSuccess: () => { queryClient.invalidateQueries(); refetch(); setIsCreateOpen(false); setSaving(false); },
      onError: () => { setError("Failed to create content"); setSaving(false); }
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await updateContent(editItem.id, { subjectId, title, notes, videoUrl });
      refetch(); setEditItem(null);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    await deleteContent(id);
    refetch();
  };

  const [contentSearch, setContentSearch] = useState("");
  const filtered = useMemo(() => {
    let list = filterSubject ? content.filter(c => c.subjectId === filterSubject) : content;
    if (contentSearch.trim()) {
      const q = contentSearch.toLowerCase();
      list = list.filter(c => c.title?.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q));
    }
    return list;
  }, [content, filterSubject, contentSearch]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5"/> Study Content</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm">
            <option value="">All Subjects</option>
            {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4"/> Add Content</Button>
        </div>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
        <input type="text" value={contentSearch} onChange={e => setContentSearch(e.target.value)}
          placeholder="Search content by title or notes…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"/>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500">Title</th>
                <th className="px-6 py-4 font-medium text-slate-500">Subject</th>
                <th className="px-6 py-4 font-medium text-slate-500 hidden md:table-cell">Notes (preview)</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{c.title}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{c.subjectTitle}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell max-w-xs truncate">{c.notes}</td>
                  <td className="px-6 py-4 text-right flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="text-primary hover:bg-primary/10">
                      <Edit2 className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No content found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Add Content">
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
              <option value="" disabled>Select a subject</option>
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lesson Title</label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video URL (optional)</label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={saving}>Save</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Edit Content">
        <form onSubmit={handleEdit} className="space-y-4 mt-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lesson Title</label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video URL (optional)</label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Update</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/* ─── QUIZ QUESTIONS ────────────────────────────────────────────────────────── */
function AdminQuiz() {
  const { data: subjects } = useGetSubjects();
  const { data: quizzes, loading, refetch } = useAdminQuizzes();
  const [filterSubject, setFilterSubject] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<{ quizId: string; qi: number; q: any } | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editOpts, setEditOpts] = useState(["", "", "", ""]);
  const [editCorrect, setEditCorrect] = useState(0);
  const [saving, setSaving] = useState(false);

  const filtered = filterSubject ? quizzes.filter(q => q.subjectId === filterSubject) : quizzes;

  const openEditQ = (quizId: string, qi: number, q: any) => {
    setEditQuestion({ quizId, qi, q });
    setEditQ(q.question);
    setEditOpts([...q.options]);
    setEditCorrect(q.correctAnswer);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuestion) return;
    setSaving(true);
    const quiz = quizzes.find(q => q.id === editQuestion.quizId);
    if (!quiz) { setSaving(false); return; }
    const updatedQuestions = quiz.questions.map((q: any, i: number) =>
      i === editQuestion.qi ? { ...q, question: editQ, options: editOpts, correctAnswer: editCorrect } : q
    );
    try {
      const { updateQuiz } = await import("@/hooks/use-admin-api");
      await updateQuiz(editQuestion.quizId, { subjectId: quiz.subjectId, questions: updatedQuestions });
      refetch(); setEditQuestion(null);
    } catch {}
    finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (quizId: string, qi: number) => {
    if (!confirm("Delete this question?")) return;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    const updatedQuestions = quiz.questions.filter((_: any, i: number) => i !== qi);
    try {
      const { updateQuiz } = await import("@/hooks/use-admin-api");
      await updateQuiz(quizId, { subjectId: quiz.subjectId, questions: updatedQuestions });
      refetch();
    } catch {}
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Delete entire quiz?")) return;
    await deleteQuiz(id);
    refetch();
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-xl font-bold">Quiz Questions</h2>
        <div className="flex gap-2 items-center">
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm">
            <option value="">All Subjects</option>
            {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <Link href="/admin/quiz-upload">
            <Button variant="outline" className="gap-2 text-sm"><Upload className="h-4 w-4"/> Bulk Upload</Button>
          </Link>
          <Link href="/admin/generate-quiz">
            <Button className="gap-2 text-sm"><Cpu className="h-4 w-4"/> AI Generate</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500">
          No quizzes found. Use Bulk Upload or AI Generate to add questions.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((quiz: any) => (
            <div key={quiz.id} className="bg-white rounded-xl border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary"/>
                  <span className="font-semibold text-slate-900">{quiz.subjectTitle}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{quiz.questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </button>

              {expanded === quiz.id && (
                <div className="border-t divide-y">
                  {quiz.questions.map((q: any, qi: number) => (
                    <div key={qi} className="px-6 py-4 hover:bg-slate-50/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{qi + 1}. {q.question}</p>
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {q.options.map((opt: string, oi: number) => (
                              <span key={oi} className={`text-xs px-2 py-1 rounded ${oi === q.correctAnswer ? 'bg-green-100 text-green-700 font-medium' : 'bg-slate-100 text-slate-500'}`}>
                                {oi === q.correctAnswer && <CheckCircle className="h-3 w-3 inline mr-1"/>}{opt}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => openEditQ(quiz.id, qi, q)} className="text-primary hover:bg-primary/10 h-8 w-8">
                            <Edit2 className="h-3 w-3"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(quiz.id, qi)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                            <X className="h-3 w-3"/>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Question Dialog */}
      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)} title="Edit Question">
        <form onSubmit={handleSaveQuestion} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <textarea className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required value={editQ} onChange={e => setEditQ(e.target.value)} />
          </div>
          {editOpts.map((opt, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Option {i + 1}
                {i === editCorrect && <span className="text-green-600 text-xs">(correct)</span>}
              </label>
              <div className="flex gap-2">
                <Input required value={opt} onChange={e => { const n = [...editOpts]; n[i] = e.target.value; setEditOpts(n); }} />
                <Button type="button" variant={editCorrect === i ? "default" : "outline"} size="sm" onClick={() => setEditCorrect(i)} className="whitespace-nowrap">
                  {editCorrect === i ? "✓ Correct" : "Set Correct"}
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setEditQuestion(null)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Update</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/* ─── USERS ─────────────────────────────────────────────────────────────────── */
function AdminUsers() {
  const { data: users } = useGetUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = useMemo(() => {
    let list = users || [];
    if (roleFilter) list = list.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return list;
  }, [users, search, roleFilter]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5"/> Registered Users</h2>
        <div className="flex gap-2">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"/>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Name</th>
              <th className="px-6 py-4 font-medium text-slate-500">Email</th>
              <th className="px-6 py-4 font-medium text-slate-500">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-medium ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">{search || roleFilter ? "No users match your search" : "No users found"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── RESULTS ───────────────────────────────────────────────────────────────── */
function AdminResults() {
  const { data: results } = useGetAllResults();
  const { data: subjects } = useGetSubjects();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const filtered = useMemo(() => {
    let list = results || [];
    if (subjectFilter) list = list.filter(r => r.subjectId === subjectFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.subjectTitle?.toLowerCase().includes(q) || r.userId?.toLowerCase().includes(q));
    }
    return list;
  }, [results, subjectFilter, search]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-bold">Platform Quiz Results</h2>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="h-10 rounded-xl border border-input bg-white px-3 py-2 text-sm">
          <option value="">All Subjects</option>
          {subjects?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"/>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by subject name…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"/>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Subject</th>
              <th className="px-6 py-4 font-medium text-slate-500">User ID</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-right">Score</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{r.subjectTitle}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{r.userId}</td>
                <td className="px-6 py-4 text-right text-slate-500">{r.score}/{r.total}</td>
                <td className="px-6 py-4 text-right font-medium">
                  <span className={r.percentage >= 80 ? "text-green-600" : r.percentage >= 60 ? "text-yellow-600" : "text-red-600"}>
                    {r.percentage}%
                  </span>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">{search || subjectFilter ? "No results match your filters" : "No results found"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

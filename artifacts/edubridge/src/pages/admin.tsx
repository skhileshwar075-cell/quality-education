import { useState } from "react";
import { Layout } from "@/components/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useGetSubjects, useCreateSubject, useDeleteSubject, useGetUsers, useGetAllResults, useCreateContent } from "@workspace/api-client-react";
import { Plus, Trash2, Settings, Users, BookOpen, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminPage() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-slate-600 mt-2">Manage subjects, content, quizzes, and monitor user progress.</p>
      </div>

      <Tabs defaultValue="subjects">
        <TabsList className="mb-8">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects"><AdminSubjects /></TabsContent>
        <TabsContent value="content"><AdminContent /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="results"><AdminResults /></TabsContent>
      </Tabs>
    </Layout>
  );
}

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
        queryClient.invalidateQueries({ queryKey: [`/api/subjects`] });
        setIsCreateOpen(false);
        setTitle("");
        setDescription("");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/subjects`] })
      });
    }
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
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)} className="text-destructive hover:bg-destructive/10">
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
            <textarea 
              className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function AdminContent() {
  const queryClient = useQueryClient();
  const { data: subjects } = useGetSubjects();
  const createMutation = useCreateContent();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { subjectId, title, notes, videoUrl } }, {
      onSuccess: () => {
        queryClient.invalidateQueries(); // invalidate all to be safe
        setIsCreateOpen(false);
        setTitle("");
        setNotes("");
        setVideoUrl("");
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5"/> Study Content</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4"/> Add Content</Button>
      </div>
      
      <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500">
        Use the button above to add study materials to existing subjects.
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Add Content">
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select 
              required 
              value={subjectId} 
              onChange={e => setSubjectId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
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
            <textarea 
              className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              required 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video URL (optional)</label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function AdminUsers() {
  const { data: users } = useGetUsers();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5"/> Registered Users</h2>
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
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                <td className="px-6 py-4 text-slate-500 uppercase text-xs tracking-wider">{u.role}</td>
              </tr>
            ))}
            {!users?.length && <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminResults() {
  const { data: results } = useGetAllResults();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">Platform Quiz Results</h2>
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
            {results?.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{r.subjectTitle}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{r.userId}</td>
                <td className="px-6 py-4 text-right text-slate-500">{r.score}/{r.total}</td>
                <td className="px-6 py-4 text-right font-medium">
                  <span className={r.percentage >= 80 ? 'text-green-600' : r.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                    {r.percentage}%
                  </span>
                </td>
              </tr>
            ))}
            {!results?.length && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No results found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

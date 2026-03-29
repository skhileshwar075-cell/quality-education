import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { useGetSubject, useGetContent } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlayCircle, FileText, ArrowLeft, BrainCircuit } from "lucide-react";

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.id as string;

  const { data: subject, isLoading: isSubjectLoading } = useGetSubject(subjectId, {
    query: { enabled: !!subjectId }
  });
  
  const { data: contents, isLoading: isContentLoading } = useGetContent(subjectId, {
    query: { enabled: !!subjectId }
  });

  if (isSubjectLoading || isContentLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!subject) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Subject not found</h2>
          <Link href="/">
            <Button className="mt-4">Go back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subjects
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">{subject.title}</h1>
          <p className="text-lg text-slate-600 max-w-3xl">{subject.description}</p>
        </div>
        <Link href={`/quiz/${subject.id}`}>
          <Button size="lg" className="rounded-xl px-8 h-14 text-lg shadow-lg shadow-primary/20 gap-3">
            <BrainCircuit className="h-5 w-5" />
            Take Chapter Quiz
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-display font-bold text-slate-900">Learning Materials</h2>
        
        {contents && contents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contents.map((content) => (
              <Card key={content.id} className="overflow-hidden flex flex-col">
                {content.videoUrl && (
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center group cursor-pointer">
                    {/* Placeholder for video player - just an aesthetic visual for now */}
                    <img 
                      src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&fit=crop`} 
                      alt="Study material"
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <PlayCircle className="h-16 w-16 text-white relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {content.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                    {content.notes}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-500">
            No study materials available for this subject yet.
          </div>
        )}
      </div>
    </Layout>
  );
}

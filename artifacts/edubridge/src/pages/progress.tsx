import { Layout } from "@/components/layout";
import { useGetMyResults } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Trophy, Target, History } from "lucide-react";

export default function ProgressPage() {
  const { data: results, isLoading } = useGetMyResults();

  const totalQuizzes = results?.length || 0;
  const avgScore = results && results.length > 0 
    ? results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length 
    : 0;

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 flex items-center gap-3">
          <LineChart className="h-10 w-10 text-primary" />
          Your Progress
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Track your learning journey and view your past quiz performances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-primary to-blue-700 text-white border-none shadow-lg shadow-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 font-medium mb-1">Average Score</p>
                <div className="text-5xl font-display font-bold">{Math.round(avgScore)}%</div>
              </div>
              <Trophy className="h-16 w-16 text-white/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1">Quizzes Completed</p>
                <div className="text-5xl font-display font-bold text-slate-900">{totalQuizzes}</div>
              </div>
              <Target className="h-16 w-16 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
        <History className="h-6 w-6 text-slate-400" />
        Recent Activity
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : results && results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-xl p-6 border shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{result.subjectTitle}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(result.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-slate-500">Score</p>
                  <p className="font-medium text-slate-900">{result.score} / {result.total}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold ${
                  result.percentage >= 80 ? 'bg-green-100 text-green-700' :
                  result.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
          <p className="text-slate-500 mb-4">You haven't completed any quizzes yet.</p>
        </div>
      )}
    </Layout>
  );
}

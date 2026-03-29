import { Layout } from "@/components/layout";
import { useAnalytics } from "@/hooks/use-admin-api";
import { Link } from "wouter";
import { ArrowLeft, Users, BarChart2, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const PIE_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const { users, quizzes, scores, loading } = useAnalytics();

  const growthData = users?.growth?.map((g: any) => ({
    date: g._id.slice(5),
    users: g.count,
  })) || [];

  const totalUsers = users?.total ?? 0;
  const totalAttempts = quizzes.reduce((sum: number, q: any) => sum + q.attempts, 0);
  const avgScore = scores.length
    ? Math.round(scores.reduce((sum: number, s: any) => sum + s.avgScore, 0) / scores.length)
    : 0;

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5"/></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-primary"/>
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Platform-wide performance and usage metrics</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">Loading analytics...</div>
      ) : (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Students", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Total Quiz Attempts", value: totalAttempts, icon: TrendingUp, color: "text-green-600 bg-green-50" },
              { label: "Average Score", value: `${avgScore}%`, icon: Target, color: "text-purple-600 bg-purple-50" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6"/>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* User Growth Line Chart */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary"/> User Growth (last 30 days)
            </h2>
            {growthData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400">No growth data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8"/>
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false}/>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}/>
                  <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quiz Attempts Bar Chart */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary"/> Quiz Attempts per Subject
              </h2>
              {quizzes.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400">No quiz data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={quizzes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="#94a3b8"/>
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false}/>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}/>
                    <Bar dataKey="attempts" fill="#6366f1" radius={[6, 6, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Average Scores Pie Chart */}
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary"/> Average Score by Subject
              </h2>
              {scores.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400">No score data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={scores}
                      dataKey="avgScore"
                      nameKey="subject"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {scores.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(v: any) => `${v}%`}/>
                    <Legend/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

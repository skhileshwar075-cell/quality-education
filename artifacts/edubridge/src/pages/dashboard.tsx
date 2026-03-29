import { Layout } from "@/components/layout";
import { useGetSubjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: subjects, isLoading, error } = useGetSubjects();

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 flex items-center gap-3">
          <GraduationCap className="h-10 w-10 text-primary" />
          Explore Subjects
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Dive into your learning journey. Choose a subject below to view study materials, watch video lectures, and test your knowledge.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-6 bg-destructive/10 border-destructive/20 text-destructive rounded-2xl">
          Failed to load subjects. Please try again later.
        </div>
      )}

      {subjects && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, idx) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/subject/${subject.id}`} className="block h-full">
                <Card className="h-full group hover:border-primary/50 cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                    <ChevronRight className="h-6 w-6 text-primary" />
                  </div>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <BookOpen className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-xl mb-2">{subject.title}</CardTitle>
                    <CardDescription className="line-clamp-3 text-base">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}

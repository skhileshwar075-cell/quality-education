import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.user.role !== "admin") {
          setError("Access denied: Not an admin");
          return;
        }
        login(data.token, data.user);
        setLocation("/admin/dashboard");
      },
      onError: (err: any) => {
        setError(err?.message || "Invalid credentials");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-amber-600 p-2 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">EduBridge</span>
              <span className="ml-2 text-xs uppercase tracking-widest font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>

          <h2 className="mt-6 text-3xl font-display font-bold tracking-tight text-slate-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Restricted access. Authorised personnel only.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Are you a student?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in here
            </Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm font-medium text-white bg-red-600 rounded-lg flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                isLoading={loginMutation.isPending}
              >
                Sign in as Admin
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center relative w-0 flex-1 bg-gradient-to-br from-amber-600 to-orange-700">
        <Shield className="h-32 w-32 text-white/20 mb-6" />
        <h3 className="text-3xl font-bold text-white text-center px-8">Admin Control Panel</h3>
        <p className="text-amber-100 text-center mt-3 px-12 text-lg">
          Manage subjects, content, quizzes, and monitor student progress.
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        setLocation("/");
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
            <div className="bg-primary p-2 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">EduBridge</span>
          </div>

          <h2 className="mt-6 text-3xl font-display font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
              create a new account
            </Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                className="w-full h-12 text-base rounded-xl"
                isLoading={loginMutation.isPending}
              >
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Abstract elegant geometric waves"
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] mix-blend-multiply" />
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { BookOpen, LogOut, LayoutDashboard, LineChart, Shield } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !!user && user?.role !== "admin" },
    { href: "/progress", label: "Progress", icon: LineChart, show: !!user && user?.role !== "admin" },
    { href: "/admin/dashboard", label: "Admin Panel", icon: Shield, show: user?.role === "admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user?.role === "admin" ? "/admin/dashboard" : user ? "/dashboard" : "/login"} className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="bg-primary/10 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight">EduBridge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => l.show).map(link => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative py-2">
                  <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-slate-600 hover:text-slate-900"}`}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
                  Hi, {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-slate-600">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
                  Log in
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full px-6">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

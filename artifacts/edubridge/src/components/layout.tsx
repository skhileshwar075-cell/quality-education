import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, LogOut, LayoutDashboard, LineChart, Shield,
  Bell, X, BarChart2, Menu, User, ChevronDown, Upload, Cpu
} from "lucide-react";

/* ─── Avatar ────────────────────────────────────────────────────────────────── */
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const s = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  return (
    <div className={`${s} rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { notifications, dismiss, clearAll } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowUserMenu(false); setShowNotifs(false); setShowMobileMenu(false); }
    };
    document.addEventListener("mousedown", clickHandler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", clickHandler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setShowMobileMenu(false); }, [location]);

  const userLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/progress", label: "My Progress", icon: LineChart },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Admin Panel", icon: Shield },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/admin/quiz-upload", label: "Bulk Upload", icon: Upload },
    { href: "/admin/generate-quiz", label: "AI Quiz", icon: Cpu },
  ];

  const navLinks = user?.role === "admin" ? adminLinks : userLinks;

  const unreadCount = notifications.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={user?.role === "admin" ? "/admin/dashboard" : user ? "/dashboard" : "/"}>
            <div className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <BookOpen className="h-5 w-5 text-white"/>
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">EduBridge</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = location === link.href || location.startsWith(link.href + "/");
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      aria-current={isActive ? "page" : undefined}
                      data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4"/>
                      {link.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Notification Bell — admins only */}
            {user?.role === "admin" && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setShowNotifs(v => !v); setShowUserMenu(false); }}
                  className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-slate-600"/>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"/>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                        <span className="font-semibold text-slate-900 text-sm">
                          Notifications {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>}
                        </span>
                        <div className="flex gap-2 items-center">
                          {unreadCount > 0 && (
                            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear all</button>
                          )}
                          <button onClick={() => setShowNotifs(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="h-3.5 w-3.5 text-slate-400"/>
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {unreadCount === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-400">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                            No new notifications
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b last:border-0 transition-colors">
                              <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                                n.type === "quiz" ? "bg-indigo-500" : n.type === "content" ? "bg-green-500" : "bg-amber-500"
                              }`}/>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{n.timestamp.toLocaleTimeString()}</p>
                              </div>
                              <button onClick={() => dismiss(n.id)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors mt-0.5">
                                <X className="h-3 w-3 text-slate-300 hover:text-slate-500"/>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Avatar + Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => { setShowUserMenu(v => !v); setShowNotifs(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Avatar name={user.name}/>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? "rotate-180" : ""}`}/>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name}/>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {user.role === "admin" ? "👑 Admin" : "🎓 Student"}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 rounded-xl">
                          <User className="h-4 w-4"/>
                          {user.email}
                        </div>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="h-4 w-4"/> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors rounded-xl hover:bg-slate-100">
                  Log in
                </Link>
                <Link href="/register">
                  <div className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                    Sign up
                  </div>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {user && (
              <button
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                onClick={() => setShowMobileMenu(v => !v)}
              >
                {showMobileMenu ? <X className="h-5 w-5 text-slate-600"/> : <Menu className="h-5 w-5 text-slate-600"/>}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = location === link.href;
                  return (
                    <Link key={link.href} href={link.href}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                      }`}>
                        <Icon className="h-4 w-4"/> {link.label}
                      </div>
                    </Link>
                  );
                })}
                <div className="border-t pt-2 mt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4"/> Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

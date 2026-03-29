import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  BookOpen, Bot, Upload, BarChart2, Shield, FileText, Bell,
  ChevronRight, Menu, X, ArrowRight, Check, GraduationCap,
  Target, TrendingUp, Mail, Github, Twitter, Linkedin, Star
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" onClick={() => scrollTo("#home")} className="flex items-center gap-2.5 cursor-pointer">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">EduBridge</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(n => (
            <button key={n.label} onClick={() => scrollTo(n.href)} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              {n.label}
            </button>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="text-sm font-medium text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              Log in
            </button>
          </Link>
          <Link href="/register">
            <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl transition-colors shadow-md shadow-indigo-200">
              Register
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => setOpen(v => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-b shadow-lg px-4 pb-4 space-y-1">
          {navItems.map(n => (
            <button key={n.label} onClick={() => scrollTo(n.href)} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors">
              {n.label}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="flex-1">
              <button className="w-full text-sm font-medium text-slate-700 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Log in</button>
            </Link>
            <Link href="/register" className="flex-1">
              <button className="w-full text-sm font-semibold text-white bg-indigo-600 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">Register</button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700"/>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 opacity-20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"/>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4"/>
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}/>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-200 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Star className="h-4 w-4 fill-current text-yellow-400"/>
            AI-Powered Learning Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Learn Smarter<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">with EduBridge</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-indigo-200 max-w-xl lg:max-w-none leading-relaxed">
            AI-powered quizzes, smart analytics, and modern learning tools — all in one place. Free, fast, and built for every learner.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/register">
              <button className="group flex items-center justify-center gap-2 text-base font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-900/50 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
              </button>
            </Link>
            <button onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center justify-center gap-2 text-base font-semibold text-indigo-200 border border-indigo-400/40 hover:border-indigo-300 hover:bg-white/10 px-8 py-4 rounded-2xl transition-all backdrop-blur-sm">
              Explore Features
              <ChevronRight className="h-4 w-4"/>
            </button>
          </div>
          {/* Stats */}
          <div className="mt-14 flex flex-wrap gap-8 justify-center lg:justify-start">
            {[
              { value: "100%", label: "Free to use" },
              { value: "AI", label: "Quiz generation" },
              { value: "∞", label: "Learning paths" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-indigo-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration / Visual Card */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-3 w-3 rounded-full bg-red-400"/>
                <div className="h-3 w-3 rounded-full bg-yellow-400"/>
                <div className="h-3 w-3 rounded-full bg-green-400"/>
                <span className="text-xs text-indigo-300 ml-2 font-mono">AI Quiz Generator</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-xs text-indigo-300 mb-1">Topic</p>
                  <p className="text-white font-medium">Algebra — Linear Equations</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm font-medium text-white mb-3">Q1: Solve 2x + 3 = 7. Find x.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["x = 1", "x = 2 ✓", "x = 3", "x = 4"].map((o, i) => (
                      <div key={i} className={`text-xs px-3 py-2 rounded-lg text-center ${i === 1 ? "bg-green-500 text-white font-semibold" : "bg-white/10 text-indigo-200"}`}>{o}</div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0"/>
                  <p className="text-sm text-green-300 font-medium">Score: 5/5 — Excellent!</p>
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-violet-500/40 animate-bounce">
              AI Powered ✨
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-full shadow-xl">
              📊 Smart Analytics
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-indigo-300 opacity-70">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-5 h-8 border-2 border-indigo-300/50 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-indigo-300 rounded-full animate-bounce"/>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
}

function FeatureCard({ icon, title, description, color, bg }: FeatureCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className={`inline-flex items-center justify-center p-3 rounded-xl ${bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <div className={`${color}`}>{icon}</div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FEATURES SECTION
───────────────────────────────────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="h-6 w-6"/>, title: "AI Quiz Generation",
      description: "Automatically generate multiple-choice questions on any topic in seconds using our AI-powered engine.",
      color: "text-indigo-600", bg: "bg-indigo-50",
    },
    {
      icon: <Upload className="h-6 w-6"/>, title: "Bulk Quiz Upload",
      description: "Import hundreds of quiz questions at once via CSV. Preview before upload and handle errors gracefully.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      icon: <BarChart2 className="h-6 w-6"/>, title: "Performance Analytics",
      description: "Track user growth, quiz attempts, and average scores with beautiful interactive charts.",
      color: "text-blue-600", bg: "bg-blue-50",
    },
    {
      icon: <Shield className="h-6 w-6"/>, title: "Secure Authentication",
      description: "Role-based JWT auth with separate student and admin portals. Your data is always protected.",
      color: "text-green-600", bg: "bg-green-50",
    },
    {
      icon: <FileText className="h-6 w-6"/>, title: "Study Material Manager",
      description: "Upload lessons with notes and video links. Students access rich content per subject with ease.",
      color: "text-amber-600", bg: "bg-amber-50",
    },
    {
      icon: <Bell className="h-6 w-6"/>, title: "Real-time Notifications",
      description: "Admins get instant alerts via WebSocket whenever new quizzes or content are published.",
      color: "text-pink-600", bg: "bg-pink-50",
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Target className="h-4 w-4"/> Platform Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything you need to learn smarter</h2>
          <p className="mt-4 text-lg text-slate-500">A complete toolkit for students and educators — all free, all powerful.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => <FeatureCard key={f.title} {...f}/>)}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      step: "01", icon: <GraduationCap className="h-7 w-7"/>,
      title: "Register or Log In",
      description: "Create a free account in seconds. Students and admins each have their own tailored dashboard.",
      color: "text-indigo-600", bg: "bg-indigo-50",
    },
    {
      step: "02", icon: <Bot className="h-7 w-7"/>,
      title: "Attempt Quizzes & Learn",
      description: "Browse subjects, read study material, take AI-generated quizzes, and learn at your own pace.",
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      step: "03", icon: <TrendingUp className="h-7 w-7"/>,
      title: "Track Your Performance",
      description: "View your quiz scores, progress history, and subject completion with detailed analytics.",
      color: "text-green-600", bg: "bg-green-50",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <ChevronRight className="h-4 w-4"/> How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Get started in three easy steps</h2>
          <p className="mt-4 text-lg text-slate-500">No complicated setup — just sign up and start learning.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(33.33%-40px)] right-[calc(33.33%-40px)] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-green-200 z-0"/>
          {steps.map((s, i) => (
            <div key={s.step} className="relative z-10 flex flex-col items-center text-center">
              <div className={`relative flex items-center justify-center h-[72px] w-[72px] rounded-2xl ${s.bg} shadow-sm mb-6`}>
                <div className={s.color}>{s.icon}</div>
                <span className={`absolute -top-2 -right-2 text-xs font-bold ${s.color} bg-white border border-current px-2 py-0.5 rounded-full`}>{s.step}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
              <p className="text-slate-500 leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="md:hidden mt-6 text-slate-200">
                  <ChevronRight className="h-8 w-8 rotate-90 mx-auto"/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ABOUT SECTION
───────────────────────────────────────────────────────────────────────────── */
function AboutSection() {
  const benefits = [
    "100% free — no hidden fees or premium paywalls",
    "AI-generated quizzes for any topic",
    "Role-based access for students and admins",
    "Real-time notifications and live analytics",
    "Secure JWT authentication",
    "Mobile-friendly and fast",
  ];

  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 p-2 rounded-xl"><BookOpen className="h-6 w-6"/></div>
                  <span className="font-bold text-lg">EduBridge Platform</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Active Students", value: "Growing", icon: "👥" },
                    { label: "Subjects Available", value: "Multiple", icon: "📚" },
                    { label: "Quiz Questions", value: "AI-Unlimited", icon: "🤖" },
                    { label: "Avg. Quiz Score", value: "Improving", icon: "📈" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span>
                        <span className="text-indigo-100 text-sm">{s.label}</span>
                      </div>
                      <span className="font-bold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600"/>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Always Free</p>
                  <p className="text-xs text-slate-400">No credit card needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Star className="h-4 w-4"/> About EduBridge
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Education made smarter,<br/>not harder
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              EduBridge is a free smart learning platform built to close the gap between traditional education and modern technology. Whether you're a student looking to master a subject or an educator managing a class, EduBridge gives you the tools to succeed.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Our AI-powered quiz engine, real-time analytics, and role-based admin panel make it easy to learn, teach, and track progress — all in one beautiful platform.
            </p>
            <ul className="space-y-3">
              {benefits.map(b => (
                <li key={b} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600"/>
                  </div>
                  <span className="text-slate-700 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl overflow-hidden p-12 sm:p-16 text-center">
          {/* Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"/>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400 opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/2"/>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}/>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4 fill-white"/>
              Join thousands of learners
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Your Learning<br/>Journey Today
            </h2>
            <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-10">
              Create a free account and unlock AI-powered quizzes, study materials, and performance tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="group flex items-center justify-center gap-2 text-base font-semibold text-indigo-700 bg-white hover:bg-indigo-50 px-8 py-4 rounded-2xl transition-all shadow-xl hover:-translate-y-0.5">
                  Join Now — It's Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                </button>
              </Link>
              <Link href="/login">
                <button className="flex items-center justify-center gap-2 text-base font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 px-8 py-4 rounded-2xl transition-all">
                  I already have an account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────────────────── */
function Footer() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <BookOpen className="h-5 w-5 text-white"/>
              </div>
              <span className="font-bold text-xl text-white">EduBridge</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              A free, AI-powered learning platform for students and educators. Learn smarter, not harder.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: <Github className="h-4 w-4"/>, href: "#" },
                { icon: <Twitter className="h-4 w-4"/>, href: "#" },
                { icon: <Linkedin className="h-4 w-4"/>, href: "#" },
                { icon: <Mail className="h-4 w-4"/>, href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-xl text-slate-400 hover:text-white transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home", action: () => scrollTo("#home") },
                { label: "Features", action: () => scrollTo("#features") },
                { label: "About", action: () => scrollTo("#about") },
              ].map(l => (
                <li key={l.label}>
                  <button onClick={l.action} className="hover:text-white hover:translate-x-1 inline-block transition-all">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} EduBridge. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with</span>
            <span className="text-red-400 mx-1">♥</span>
            <span>for learners everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOME PAGE EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
}

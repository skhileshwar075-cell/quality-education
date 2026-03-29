import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminRoute, UserRoute } from "@/components/protected-route";
import "@/lib/fetch-interceptor";

// Pages
import LoginPage from "@/pages/login";
import AdminLoginPage from "@/pages/admin-login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import SubjectPage from "@/pages/subject";
import QuizPage from "@/pages/quiz";
import ProgressPage from "@/pages/progress";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Root redirects to user login */}
      <Route path="/">
        <Redirect to="/login" />
      </Route>

      {/* User-protected routes */}
      <Route path="/dashboard">
        <UserRoute><DashboardPage /></UserRoute>
      </Route>
      <Route path="/subject/:id">
        {(params) => <UserRoute><SubjectPage /></UserRoute>}
      </Route>
      <Route path="/quiz/:subjectId">
        {(params) => <UserRoute><QuizPage /></UserRoute>}
      </Route>
      <Route path="/progress">
        <UserRoute><ProgressPage /></UserRoute>
      </Route>

      {/* Admin-protected routes */}
      <Route path="/admin/dashboard">
        <AdminRoute><AdminPage /></AdminRoute>
      </Route>

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

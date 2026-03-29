import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-9xl font-display font-black text-slate-200 mb-6">404</div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Page not found</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl px-8 h-12">
            Return Home
          </Button>
        </Link>
      </div>
    </Layout>
  );
}

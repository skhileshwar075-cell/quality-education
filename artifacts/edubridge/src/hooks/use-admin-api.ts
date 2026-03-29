import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "edubridge_token";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export function useAdminContent(subjectId?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const url = subjectId ? `/api/admin/content?subjectId=${subjectId}` : `/api/admin/content`;
      const res = await fetch(url, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch content");
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

export function useAdminQuizzes(subjectId?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const url = subjectId ? `/api/admin/quiz?subjectId=${subjectId}` : `/api/admin/quiz`;
      const res = await fetch(url, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {}
    finally { setLoading(false); }
  }, [subjectId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, refetch: fetch_ };
}

export async function updateContent(id: string, body: object): Promise<void> {
  const res = await fetch(`/api/admin/content/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to update content");
  }
}

export async function deleteContent(id: string): Promise<void> {
  const res = await fetch(`/api/admin/content/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete content");
}

export async function deleteQuiz(id: string): Promise<void> {
  const res = await fetch(`/api/admin/quiz/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete quiz");
}

export async function updateQuiz(id: string, body: object): Promise<void> {
  const res = await fetch(`/api/admin/quiz/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || "Failed to update quiz");
  }
}

export function useAnalytics() {
  const [users, setUsers] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = authHeaders();
    Promise.all([
      fetch("/api/admin/analytics/users", { headers: h }).then((r) => r.json()),
      fetch("/api/admin/analytics/quizzes", { headers: h }).then((r) => r.json()),
      fetch("/api/admin/analytics/scores", { headers: h }).then((r) => r.json()),
    ])
      .then(([u, q, s]) => {
        setUsers(u);
        setQuizzes(Array.isArray(q) ? q : []);
        setScores(Array.isArray(s) ? s : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { users, quizzes, scores, loading };
}

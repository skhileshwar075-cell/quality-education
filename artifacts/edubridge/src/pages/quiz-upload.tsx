import { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Download, Copy, Check } from "lucide-react";
import { useGetSubjects } from "@workspace/api-client-react";

const TOKEN_KEY = "edubridge_token";
function authHeaders(includeJson = false): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const h: HeadersInit = {};
  if (token) (h as any)["Authorization"] = `Bearer ${token}`;
  if (includeJson) (h as any)["Content-Type"] = "application/json";
  return h;
}

export default function QuizUploadPage() {
  const { data: subjects } = useGetSubjects();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ errors: string[]; insertedSubjects: number } | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f); setPreview([]); setPreviewTotal(0); setResult(null); setError("");
  };

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/quiz/preview", { method: "POST", headers: authHeaders(), body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Preview failed");
      setPreview(json.rows); setPreviewTotal(json.total);
    } catch (e: any) { setError(e.message); }
    finally { setPreviewing(false); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/quiz/bulk-upload", { method: "POST", headers: authHeaders(), body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setResult(json);
    } catch (e: any) { setError(e.message); }
    finally { setUploading(false); }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const downloadSample = () => {
    const subjectLine = subjects?.length
      ? `What is 2 + 2?,3,4,5,6,1,${subjects[0].id}\nWhat is the capital of France?,London,Berlin,Paris,Madrid,2,${subjects[0].id}`
      : `What is 2 + 2?,3,4,5,6,1,REPLACE_WITH_SUBJECT_ID\nWhat is the capital of France?,London,Berlin,Paris,Madrid,2,REPLACE_WITH_SUBJECT_ID`;
    const csv = `question,option1,option2,option3,option4,correctAnswer,subjectId\n${subjectLine}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quiz_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard">
          <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
            <ArrowLeft className="h-5 w-5"/>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Upload className="h-8 w-8 text-indigo-600"/> Bulk Quiz Upload
          </h1>
          <p className="text-slate-500 mt-1">Upload a CSV file to add multiple quiz questions at once</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Subject IDs Reference Card */}
        {subjects && subjects.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600"/> Subject IDs (copy these into your CSV)
            </h3>
            <div className="space-y-2">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 group">
                  <span className="text-sm font-semibold text-slate-700">{s.title}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-500 font-mono hidden sm:block">{s.id}</code>
                    <button
                      onClick={() => copyId(s.id)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                      title="Copy ID"
                    >
                      {copiedId === s.id ? <Check className="h-3.5 w-3.5 text-green-600"/> : <Copy className="h-3.5 w-3.5"/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CSV Instructions */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> CSV Format</h3>
          <code className="text-xs text-indigo-800 bg-indigo-100 block px-3 py-2 rounded-lg font-mono">
            question, option1, option2, option3, option4, correctAnswer, subjectId
          </code>
          <ul className="text-sm text-indigo-800 mt-3 space-y-1">
            <li>• <strong>correctAnswer</strong>: 0–3 (index of the correct option, zero-based)</li>
            <li>• <strong>subjectId</strong>: MongoDB ObjectId from the table above</li>
            <li>• One question per row, skip the header row</li>
          </ul>
          <button onClick={downloadSample} className="mt-3 flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors">
            <Download className="h-4 w-4"/> Download template{subjects?.length ? ` (with ${subjects[0].title} ID pre-filled)` : ""}
          </button>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
            file ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30"
          }`}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".csv")) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}/>
          {file ? (
            <div>
              <CheckCircle className="h-12 w-12 text-indigo-600 mx-auto mb-3"/>
              <p className="font-bold text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB • CSV file</p>
              <button
                className="mt-3 text-xs text-slate-400 hover:text-red-500 transition-colors"
                onClick={e => { e.stopPropagation(); setFile(null); setPreview([]); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
              >
                ✕ Remove file
              </button>
            </div>
          ) : (
            <div>
              <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3"/>
              <p className="font-bold text-slate-700">Drop your CSV here or click to browse</p>
              <p className="text-sm text-slate-400 mt-1">Max 5 MB · CSV files only</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {file && !result && (
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {previewing ? <><div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/> Parsing...</> : <><FileText className="h-4 w-4"/> Preview ({previewTotal || "?"} rows)</>}
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {uploading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Uploading...</> : <><Upload className="h-4 w-4"/> Upload & Save</>}
            </button>
          </div>
        )}

        {/* Preview Table */}
        {preview.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Preview <span className="text-slate-400 font-normal">— first {preview.length} of {previewTotal} rows</span></h3>
            </div>
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="text-xs w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap capitalize">{k}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      {Object.values(row).map((v: any, j) => (
                        <td key={j} className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {uploading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Uploading...</> : <><Upload className="h-4 w-4"/> Confirm & Upload All {previewTotal} Rows</>}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl border p-6 ${result.errors.length === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className={`h-6 w-6 ${result.errors.length === 0 ? "text-green-600" : "text-amber-600"}`}/>
              <div>
                <p className="font-bold text-slate-900">Upload Complete</p>
                <p className="text-sm text-slate-600">{result.insertedSubjects} subject(s) updated with new questions</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3 bg-white/60 rounded-xl p-3">
                <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Warnings ({result.errors.length}):</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setFile(null); setPreview([]); setResult(null); setPreviewTotal(0); if (fileRef.current) fileRef.current.value = ""; }}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-300 transition-colors"
              >
                Upload Another
              </button>
              <Link href="/admin/dashboard" className="flex-1">
                <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

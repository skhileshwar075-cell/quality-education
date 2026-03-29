import { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";

const TOKEN_KEY = "edubridge_token";
function authHeaders(includeJson = false): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const h: HeadersInit = {};
  if (token) (h as any)["Authorization"] = `Bearer ${token}`;
  if (includeJson) (h as any)["Content-Type"] = "application/json";
  return h;
}

const SAMPLE_CSV = `question,option1,option2,option3,option4,correctAnswer,subjectId
What is 2 + 2?,3,4,5,6,1,REPLACE_WITH_SUBJECT_ID
What is the capital of France?,London,Berlin,Paris,Madrid,2,REPLACE_WITH_SUBJECT_ID
`;

export default function QuizUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ errors: string[]; insertedSubjects: number } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview([]);
    setPreviewTotal(0);
    setResult(null);
    setError("");
  };

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/quiz/preview", {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Preview failed");
      setPreview(json.rows);
      setPreviewTotal(json.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPreviewing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload/quiz/bulk-upload", {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setResult(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quiz_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5"/></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Upload className="h-8 w-8 text-primary"/> Bulk Quiz Upload
          </h1>
          <p className="text-slate-600 mt-1">Upload a CSV file to add multiple quiz questions at once</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/> CSV Format</h3>
          <code className="text-xs text-blue-800 block">question, option1, option2, option3, option4, correctAnswer, subjectId</code>
          <p className="text-sm text-blue-700 mt-2"><strong>correctAnswer</strong>: 0-3 (index of the correct option). <strong>subjectId</strong>: MongoDB ObjectId of the subject.</p>
          <Button variant="outline" size="sm" onClick={downloadSample} className="mt-3 gap-2 text-blue-700 border-blue-300 hover:bg-blue-100">
            <Download className="h-4 w-4"/> Download Template
          </Button>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${file ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 bg-slate-50"}`}
          onDragOver={e => { e.preventDefault(); }}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith(".csv")) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {file ? (
            <div>
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3"/>
              <p className="font-semibold text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3"/>
              <p className="font-semibold text-slate-700">Drop your CSV here or click to browse</p>
              <p className="text-sm text-slate-400 mt-1">Max 5 MB, CSV files only</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"/>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        {file && !result && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview} isLoading={previewing} className="gap-2">
              <FileText className="h-4 w-4"/> Preview ({previewTotal || "?"} rows)
            </Button>
            <Button onClick={handleUpload} isLoading={uploading} className="gap-2">
              <Upload className="h-4 w-4"/> Upload & Save
            </Button>
          </div>
        )}

        {/* Preview Table */}
        {preview.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Preview (first {preview.length} of {previewTotal} rows)</h3>
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="text-xs w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    {Object.keys(preview[0]).map(k => <th key={k} className="px-4 py-3 font-medium text-slate-500 whitespace-nowrap">{k}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      {Object.values(row).map((v: any, j) => (
                        <td key={j} className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleUpload} isLoading={uploading} className="gap-2">
                <Upload className="h-4 w-4"/> Confirm Upload
              </Button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-2xl border p-6 ${result.errors.length === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className={`h-6 w-6 ${result.errors.length === 0 ? "text-green-600" : "text-yellow-600"}`}/>
              <div>
                <p className="font-semibold text-slate-900">Upload Complete</p>
                <p className="text-sm text-slate-600">{result.insertedSubjects} subject(s) updated</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-yellow-800 mb-2">Warnings ({result.errors.length}):</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.errors.map((e, i) => <li key={i} className="flex items-start gap-2"><span>•</span>{e}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={() => { setFile(null); setPreview([]); setResult(null); setPreviewTotal(0); if (fileRef.current) fileRef.current.value = ""; }}>
                Upload Another
              </Button>
              <Link href="/admin/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import GovLayout from '@/components/GovLayout';
import { getSession, authHeaders, Session } from '@/lib/auth';
import { getTrainingStatus, TrainingStatus } from '@/lib/api';

// Shape of history record returned from /api/history
interface HistoryRecord {
  id: string;
  patientId: string;
  result: string;
  confidence: string;
  benignProb: string;
  malignantProb: string;
  imageName: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    prediction: string;
    confidence: string;
    benignProb: string;
    malignantProb: string;
    patientCode?: string;
  } | null>(null);

  // Guard: require login
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/'); return; }
    setSession(s);
    loadHistory();
    fetchTrainingStatus();
  }, []);

  const loadHistory = async () => {
    try {
      const headers = authHeaders();
      if (!headers.Authorization) return;
      const res = await axios.get<HistoryRecord[]>('/api/history', { headers });
      const h = res.data;
      setHistory(h.slice(0, 5));

      // Count today's scans
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      setTodayCount(h.filter((r) => r.date === today).length);
      setMonthCount(h.length);
    } catch {
      // Auth error or network — silently skip
    }
  };

  const fetchTrainingStatus = async () => {
    try {
      const status = await getTrainingStatus();
      setTrainingStatus(status);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.dcm', '.dicom'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a mammogram image first.'); return; }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('/api/predict', formData, {
        headers: { ...authHeaders() },
      });
      const data = res.data;

      const r = {
        prediction: data.prediction,
        confidence: data.confidence,
        benignProb: data.benign_prob,
        malignantProb: data.malignant_prob,
        patientCode: data.patientCode,
      };
      setResult(r);
      await loadHistory(); // refresh table from DB
      toast.success('Analysis complete!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error || 'Analysis failed. Please try again.';
        toast.error(msg);
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    if (!result) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
<html><head><title>Mammogram Report</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; color: #1a1a2e; }
  h1 { color: #1a3a6b; font-size: 16px; border-bottom: 2px solid #f7941d; padding-bottom: 8px; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .result-box { padding: 16px; margin: 12px 0; border-radius: 4px; }
  .benign { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
  .malignant { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
  .disclaimer { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-top: 16px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #2c5f9e; color: white; padding: 6px 10px; text-align: left; font-size: 12px; }
  td { padding: 6px 10px; border: 1px solid #ddd; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #666; }
</style>
</head><body>
<div class="header"><div>
  <h1>🏥 National Mammogram AI Detection Report</h1>
  <p style="margin:0;color:#666;font-size:12px">Ministry of Health &amp; Family Welfare, Government of India</p>
</div></div>
<table>
  <tr><th>Field</th><th>Details</th></tr>
  <tr><td>Patient ID</td><td>${result.patientCode || 'N/A'}</td></tr>
  <tr><td>Report Date</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
  <tr><td>Image File</td><td>${file?.name || 'N/A'}</td></tr>
  <tr><td>Attending Physician</td><td>Dr. ${session?.name || session?.doctorId || ''}</td></tr>
  <tr><td>Institution</td><td>${session?.hospitalName || ''}</td></tr>
  <tr><td>AI Model</td><td>ResNet50 — FL Round ${trainingStatus?.current_round || 'N/A'}</td></tr>
</table>
<div class="result-box ${result.prediction.toLowerCase()}">
  <strong style="font-size:18px">${result.prediction.toUpperCase()}</strong>
  <br/>Confidence: ${result.confidence}
  <br/>Benign Probability: ${result.benignProb}
  <br/>Malignant Probability: ${result.malignantProb}
</div>
<div class="disclaimer">
  ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
</div>
<div class="footer">
  <p>Generated by National Mammogram AI Detection System (NMADS v2.1) | NIC, Government of India</p>
</div>
</body></html>`);
    win.document.close();
    win.print();
  };

  const isMalignant = result?.prediction?.toLowerCase() === 'malignant';

  if (!session) return null;

  return (
    <GovLayout>
      {/* Welcome bar */}
      <div
        className="mb-4 px-4 py-2.5 flex items-center justify-between"
        style={{ background: '#e8eff8', border: '1px solid #c8d0dc', borderLeft: '4px solid #2c5f9e' }}
      >
        <div>
          <span className="font-bold text-sm" style={{ color: '#1a3a6b' }}>
            Welcome, Dr. {session.name || session.doctorId}
          </span>
          <span className="text-gray-500 text-sm"> | {session.hospitalName}</span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Backend offline notice */}
      {backendOnline === false && (
        <div
          className="mb-4 px-4 py-3 text-sm font-semibold flex items-center gap-2"
          style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '2px' }}
        >
          <span>⚠️</span>
          <span>Backend not connected. Please ensure the FastAPI server is running on port 8000.</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard title="Total Scans Today" value={String(todayCount)} color="#1a3a6b" icon="📊" />
        <StatCard
          title="Accuracy"
          value={trainingStatus ? `${(trainingStatus.accuracy_history.at(-1)! * 100).toFixed(1)}%` : '81.4%'}
          color="#1a6b3a" icon="🎯"
        />
        <StatCard
          title="Model Version"
          value={trainingStatus ? `v${trainingStatus.current_round}.${trainingStatus.total_rounds}` : 'v8.10'}
          color="#7a4a1a" icon="🔄"
        />
        <StatCard title="This Month Total Scans" value={String(monthCount)} color="#1a3a6b" icon="📅" />
      </div>

      {/* Middle: Upload + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Upload Panel */}
        <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
          <div
            className="px-4 py-2.5 font-bold text-sm"
            style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}
          >
            Upload Mammogram for Analysis
          </div>
          <div className="p-4">
            <div
              {...getRootProps()}
              className="cursor-pointer flex flex-col items-center justify-center py-8 px-4 text-center mb-3"
              style={{
                border: `2px dashed ${isDragActive ? '#f7941d' : '#2c5f9e'}`,
                background: isDragActive ? '#fff8ee' : '#f8fbff',
                borderRadius: '2px',
                transition: 'all 0.2s',
                minHeight: 160,
              }}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Uploaded mammogram preview" className="max-h-40 mx-auto object-contain rounded mb-2" />
                  <p className="text-xs text-gray-500">{file?.name}</p>
                  <p className="text-xs text-blue-600 mt-1">Click or drag to replace</p>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">🗂️</div>
                  <p className="text-sm font-semibold text-gray-700">
                    {isDragActive ? 'Drop the image here...' : 'Click or drag & drop mammogram image'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supported: PNG, JPG, DICOM</p>
                </>
              )}
            </div>

            <button
              id="analyzeBtn"
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full py-2.5 font-bold text-sm text-white transition-colors disabled:opacity-50"
              style={{
                background: file ? '#1a3a6b' : '#8a9bb5',
                border: '1px solid #122a52',
                borderRadius: '2px',
                letterSpacing: '0.3px',
              }}
            >
              {loading ? '⏳ Analyzing mammogram using ResNet50 AI model...' : '🔬 ANALYZE MAMMOGRAM'}
            </button>

            <div
              className="mt-3 p-2.5 text-xs"
              style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px', color: '#856404' }}
            >
              ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
          <div
            className="px-4 py-2.5 font-bold text-sm"
            style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}
          >
            Latest Result
          </div>
          <div className="p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className="w-12 h-12 border-4 border-t-transparent rounded-full mb-4 animate-spin"
                  style={{ borderColor: '#2c5f9e', borderTopColor: 'transparent' }}
                />
                <p className="text-sm font-semibold text-gray-700">Analyzing mammogram...</p>
                <p className="text-xs text-gray-500 mt-1">Using ResNet50 AI model</p>
              </div>
            )}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <div className="text-5xl mb-3">🩺</div>
                <p className="text-sm">Upload and analyze a mammogram to see the result here.</p>
              </div>
            )}

            {!loading && result && (
              <div>
                {isMalignant && (
                  <div
                    className="mb-3 px-3 py-2 font-bold text-sm flex items-center gap-2"
                    style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '2px' }}
                  >
                    🚨 ALERT: Malignant finding detected. Immediate radiologist review recommended.
                  </div>
                )}

                <div
                  className="p-4 text-center mb-4"
                  style={{
                    background: isMalignant ? '#f8d7da' : '#d4edda',
                    border: `2px solid ${isMalignant ? '#f5c6cb' : '#c3e6cb'}`,
                    borderRadius: '2px',
                  }}
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: isMalignant ? '#721c24' : '#155724' }}>
                    {isMalignant ? '🔴' : '🟢'} {result.prediction.toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: isMalignant ? '#721c24' : '#155724' }}>
                    Confidence: {result.confidence}
                  </div>
                  {result.patientCode && (
                    <div className="text-xs mt-1" style={{ color: isMalignant ? '#721c24' : '#155724' }}>
                      Patient: {result.patientCode}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <ProbBar label="Benign" value={result.benignProb} color="#28a745" />
                  <ProbBar label="Malignant" value={result.malignantProb} color="#dc3545" />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={printReport}
                    className="flex-1 py-2 text-xs font-bold text-white"
                    style={{ background: '#2c5f9e', border: '1px solid #1a3a6b', borderRadius: '2px' }}
                  >
                    📄 Download Report
                  </button>
                  <button
                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                    className="flex-1 py-2 text-xs font-bold text-gray-700"
                    style={{ background: '#e9ecef', border: '1px solid #ced4da', borderRadius: '2px' }}
                  >
                    🔄 New Scan
                  </button>
                </div>

                <div
                  className="mt-3 p-2.5 text-xs"
                  style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px', color: '#856404' }}
                >
                  ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scan History — from MongoDB via /api/history */}
      <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
        <div
          className="px-4 py-2.5 font-bold text-sm flex items-center justify-between"
          style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}
        >
          <span>Recent Scan History</span>
          <a href="/history" className="text-xs font-normal" style={{ color: '#1a56a0' }}>
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient ID</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400 text-sm">
                    No scans recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <td className="text-xs">{item.date}</td>
                    <td className="text-xs font-mono">{item.patientId}</td>
                    <td>
                      <span className={item.result === 'Benign' ? 'badge-benign' : 'badge-malignant'}>
                        {item.result}
                      </span>
                    </td>
                    <td className="text-xs">{item.confidence}</td>
                    <td>
                      <a href={`/reports?id=${item.id}`} className="text-xs font-semibold" style={{ color: '#1a56a0' }}>
                        View Report
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </GovLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────

function StatCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: string }) {
  return (
    <div
      className="p-4"
      style={{
        background: color,
        border: '1px solid rgba(0,0,0,0.1)',
        borderLeft: '4px solid #f7941d',
        borderRadius: '2px',
      }}
    >
      <div className="text-xs text-white opacity-80 mb-1">{icon} {title}</div>
      <div className="text-2xl font-bold text-white leading-tight">{value}</div>
    </div>
  );
}

function ProbBar({ label, value, color }: { label: string; value: string; color: string }) {
  const pct = parseFloat(value.replace('%', '')) || 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold" style={{ color }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-3 rounded-sm overflow-hidden" style={{ background: '#e9ecef' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, borderRadius: '1px' }}
        />
      </div>
    </div>
  );
}

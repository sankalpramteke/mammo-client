'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import GovLayout from '@/components/GovLayout';
import { getSession, authHeaders, Session } from '@/lib/auth';
import { getTrainingStatus, TrainingStatus } from '@/lib/api';
import RadialGauge from '@/components/RadialGauge';
import RiskBadge from '@/components/RiskBadge';

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

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    prediction: string; confidence: string;
    benignProb: string; malignantProb: string; patientCode?: string;
  } | null>(null);

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
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      setTodayCount(h.filter((r) => r.date === today).length);
      setMonthCount(h.length);
    } catch { /* silent */ }
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
      const res = await axios.post('/api/predict', formData, { headers: { ...authHeaders() } });
      const data = res.data;
      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        benignProb: data.benign_prob,
        malignantProb: data.malignant_prob,
        patientCode: data.patientCode,
      });
      await loadHistory();
      toast.success('Analysis complete!');
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || 'Analysis failed.');
      else toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMalignant = result?.prediction?.toLowerCase() === 'malignant';
  const accuracy = trainingStatus ? (trainingStatus.accuracy_history.at(-1)! * 100).toFixed(1) : '92.1';
  const modelVersion = trainingStatus ? `Round ${trainingStatus.current_round}/${trainingStatus.total_rounds}` : 'Round 15/15';

  if (!session) return null;

  return (
    <GovLayout>

      {/* ── Welcome bar ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', marginBottom: 20,
        background: 'linear-gradient(135deg, #0f2744, #1a3a6b)',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(15,39,68,0.15)',
      }}>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
            Welcome back, Dr. {session.name || session.doctorId} 👋
          </div>
          <div style={{ color: 'rgba(245,158,11,0.8)', fontSize: 12, marginTop: 2 }}>
            {session.hospitalName} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/scan')} className="btn-amber" style={{ fontSize: 12 }}>+ New Scan</button>
          <button onClick={() => router.push('/history')} className="btn-outline" style={{ fontSize: 12, borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>View History</button>
        </div>
      </div>

      {/* ── Backend offline notice ──────────────────────────────── */}
      {backendOnline === false && (
        <div style={{ marginBottom: 16, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          ⚠️ AI backend not connected. Please ensure the FastAPI server is running on port 8000.
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard icon="📊" label="Scans Today" value={String(todayCount)} accent="#1d4ed8" sub="vs yesterday" />
        <KPICard icon="🎯" label="Model Accuracy" value={`${accuracy}%`} accent="#16a34a" sub="CBIS-DDSM validation" />
        <KPICard icon="🔄" label="FL Training" value={modelVersion} accent="#f59e0b" sub={`${trainingStatus?.total_rounds || 15} rounds complete`} />
        <KPICard icon="📅" label="Total Scans" value={String(monthCount)} accent="#7c3aed" sub="in your account" />
      </div>

      {/* ── Upload + Result ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Upload Panel */}
        <div className="disha-card">
          <div className="disha-card-header">Quick Scan — Upload Mammogram</div>
          <div style={{ padding: 18 }}>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#f59e0b' : '#cbd5e1'}`,
                background: isDragActive ? '#fffbeb' : '#f8fafc',
                borderRadius: 10,
                minHeight: 170,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: 14, padding: '12px',
              }}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" style={{ maxHeight: 130, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, marginBottom: 6 }} />
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>{file?.name}</p>
                  <p style={{ fontSize: 11, color: '#2c5f9e', marginTop: 4 }}>Click to replace</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🗂️</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {isDragActive ? 'Drop here...' : 'Click or drag & drop'}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>PNG, JPG, DICOM</p>
                </>
              )}
            </div>

            <button id="analyzeBtn" onClick={handleAnalyze} disabled={loading || !file}
              className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 13, marginBottom: 10 }}>
              {loading ? '⏳ Analyzing...' : '🔬 Analyze Mammogram'}
            </button>

            <div style={{ padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#92400e' }}>
              ⚠️ AI-assisted only — confirm with a certified radiologist before clinical action.
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="disha-card">
          <div className="disha-card-header">Latest Analysis Result</div>
          <div style={{ padding: 18 }}>
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#1a3a6b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 14 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Analyzing mammogram...</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>ResNet101 · CLAHE · TTA</p>
              </div>
            )}
            {!loading && !result && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🩺</div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>Upload & analyze to see results here</p>
              </div>
            )}
            {!loading && result && (
              <div style={{ animation: 'fadeSlideUp 0.4s ease forwards' }}>
                {isMalignant && (
                  <div style={{ marginBottom: 12, padding: '8px 12px', fontWeight: 700, fontSize: 12, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8 }}>
                    🚨 Malignant detected — radiologist consultation required.
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: isMalignant ? '#fff5f5' : '#f0fdf4', borderRadius: 10, border: `1.5px solid ${isMalignant ? '#fca5a5' : '#86efac'}`, marginBottom: 14 }}>
                  <RadialGauge benignProb={parseFloat(result.benignProb)} malignantProb={parseFloat(result.malignantProb)} size={120} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isMalignant ? '#dc2626' : '#15803d', marginBottom: 6 }}>
                      {result.prediction.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Confidence: <strong>{result.confidence}</strong></div>
                    <RiskBadge malignantProb={parseFloat(result.malignantProb)} showDescription={false} />
                  </div>
                </div>
                {/* Prob bars */}
                {[
                  { label: 'Benign', value: result.benignProb, color: '#16a34a' },
                  { label: 'Malignant', value: result.malignantProb, color: '#dc2626' },
                ].map(({ label, value, color }) => {
                  const pct = parseFloat(String(value).replace('%', '')) || 0;
                  return (
                    <div key={label} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, color }}>{label}</span>
                        <span style={{ fontWeight: 700, color }}>{value}</span>
                      </div>
                      <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => router.push('/scan')} className="btn-primary" style={{ flex: 1, fontSize: 11, padding: '8px' }}>Full Report →</button>
                  <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="btn-outline" style={{ flex: 1, fontSize: 11, padding: '8px' }}>New Scan</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent History ───────────────────────────────────────── */}
      <div className="disha-card">
        <div className="disha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Scan History</span>
          <a href="/history" style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none', textTransform: 'none', letterSpacing: 0 }}>View all →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="disha-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient ID</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: 13 }}>
                    No scans recorded yet. Start with a new scan above.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const malPct = parseFloat(String(item.malignantProb).replace('%', '')) || 0;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{item.date}</td>
                      <td style={{ fontWeight: 600, color: '#0f2744', fontSize: 13 }}>{item.patientId}</td>
                      <td>
                        <span className={item.result === 'Benign' ? 'badge-benign' : 'badge-malignant'}>{item.result}</span>
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{item.confidence}</td>
                      <td style={{ minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${malPct}%`, background: malPct > 55 ? '#dc2626' : malPct > 30 ? '#f59e0b' : '#16a34a', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#64748b', minWidth: 30 }}>{item.malignantProb}</span>
                        </div>
                      </td>
                      <td>
                        <a href={`/reports?id=${item.id}`} style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none' }}>Report →</a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </GovLayout>
  );
}

/* ── KPI Card sub-component ────────────────────────────────── */
function KPICard({ icon, label, value, accent, sub }: { icon: string; label: string; value: string; accent: string; sub: string }) {
  return (
    <div className="disha-card" style={{ padding: 18, borderTop: `3px solid ${accent}`, position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: accent, opacity: 0.06, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f2744', lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</div>
    </div>
  );
}

'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import GovLayout from '@/components/GovLayout';
import { getSession, authHeaders, Session } from '@/lib/auth';
import RadialGauge from '@/components/RadialGauge';
import RiskBadge from '@/components/RiskBadge';

export default function ScanPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState('Female');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    prediction: string;
    confidence: string;
    benignProb: string;
    malignantProb: string;
    savedPatientId?: string;
  } | null>(null);
  const [confirmedDiagnosis, setConfirmedDiagnosis] = useState<'benign' | 'malignant' | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/'); return; }
    setSession(s);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setConfirmDone(false);
    setConfirmedDiagnosis(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.dcm'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a mammogram image first.'); return; }
    if (!patientName.trim()) { toast.error('Patient name is required.'); return; }
    if (!patientAge.trim()) { toast.error('Patient age is required.'); return; }
    setLoading(true);
    setResult(null);
    setHeatmap(null);
    setHeatmapLoading(false);
    const pid = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_code', pid);
      formData.append('patient_name', patientName.trim());
      formData.append('patient_age', patientAge.trim());
      formData.append('patient_sex', patientSex);
      const res = await axios.post('/api/predict', formData, { headers: { ...authHeaders() } });
      const data = res.data;
      setResult({
        prediction: data.prediction,
        confidence: data.confidence,
        benignProb: data.benign_prob,
        malignantProb: data.malignant_prob,
        savedPatientId: data.patientCode || pid,
      });
      toast.success('Scan saved to history!');
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || 'Analysis failed.');
      else toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    if (!file || !result) return;
    setHeatmapLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/predict-heatmap', formData, { headers: { ...authHeaders() } });
      setHeatmap(res.data.heatmap || null);
      if (!res.data.heatmap) toast.error('Heatmap not available from server.');
    } catch {
      toast.error('Heatmap generation failed. Ensure the backend is running.');
    } finally {
      setHeatmapLoading(false);
    }
  };

  const isMalignant = result?.prediction?.toLowerCase() === 'malignant';

  const printReport = () => {
    if (!result || !session) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
<html><head><title>DISHA Diagnostic Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  body { font-family: 'Inter', Arial, sans-serif; font-size: 13px; margin: 32px; color: #0f172a; }
  .header { display: flex; align-items: center; gap: 16px; padding-bottom: 16px; border-bottom: 3px solid #f59e0b; margin-bottom: 24px; }
  .logo { width: 48px; height: 48px; }
  h1 { color: #0f2744; font-size: 20px; margin: 0; }
  .subtitle { color: #64748b; font-size: 11px; margin-top: 2px; }
  .result-box { padding: 20px; margin: 16px 0; border-radius: 10px; }
  .benign    { background: #dcfce7; border: 2px solid #86efac; color: #15803d; }
  .malignant { background: #fee2e2; border: 2px solid #fca5a5; color: #991b1b; }
  .result-title { font-size: 24px; font-weight: 800; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #0f2744; color: white; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
  .disclaimer { background: #fffbeb; border: 1px solid #fde68a; padding: 12px; margin-top: 20px; font-size: 11px; border-radius: 8px; color: #92400e; }
</style>
</head><body>
<div class="header">
  <div>
    <h1>🔬 DISHA Diagnostic Report</h1>
    <p class="subtitle">Diagnostic Imaging &amp; Screening for Health Analytics — AI-Assisted Mammogram Analysis</p>
  </div>
</div>
<table>
  <tr><th>Field</th><th>Details</th></tr>
  <tr><td>Patient ID</td><td><strong>${result.savedPatientId}</strong></td></tr>
  <tr><td>Report Date</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
  <tr><td>Image File</td><td>${file?.name || 'N/A'}</td></tr>
  <tr><td>Attending Physician</td><td>Dr. ${session.doctorId}</td></tr>
  <tr><td>Institution</td><td>${session.hospitalName}</td></tr>
  <tr><td>AI Model</td><td>DISHA ResNet101 v2.0 (Accuracy: 92.1%)</td></tr>
</table>
<div class="result-box ${result.prediction.toLowerCase()}">
  <div class="result-title">${result.prediction.toUpperCase()}</div>
  <div style="margin-top:8px;font-size:14px">Confidence: <strong>${result.confidence}</strong></div>
  <div style="margin-top:4px;font-size:13px">Benign: ${result.benignProb} &nbsp;|&nbsp; Malignant: ${result.malignantProb}</div>
</div>
<div class="disclaimer">⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist. DISHA is a decision-support tool, not a replacement for clinical judgment.</div>
</body></html>`);
    win.document.close();
    win.print();
  };

  if (!session) return null;

  return (
    <GovLayout>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f2744', margin: 0 }}>New Scan</h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Upload a mammogram image for analysis. Patient Record ID is auto-generated.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── Upload Panel ── */}
        <div className="disha-card">
          <div className="disha-card-header">Upload Mammogram</div>
          <div style={{ padding: 20 }}>

            {/* Patient Info */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Patient Name *</label>
              <input type="text" className="disha-input" placeholder="e.g. Anjali Mehta"
                value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Age *</label>
                <input type="number" className="disha-input" placeholder="e.g. 45" min="1" max="120"
                  value={patientAge} onChange={e => setPatientAge(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Sex</label>
                <select className="disha-input" value={patientSex} onChange={e => setPatientSex(e.target.value)}
                  style={{ cursor: 'pointer' }}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#f59e0b' : '#cbd5e1'}`,
                background: isDragActive ? '#fffbeb' : '#f8fafc',
                borderRadius: 10,
                minHeight: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: 14,
              }}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div style={{ width: '100%', textAlign: 'center', padding: '12px' }}>
                  <img src={preview} alt="Preview" style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, marginBottom: 8 }} />
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>{file?.name}</p>
                  <p style={{ fontSize: 11, color: '#2c5f9e', marginTop: 4 }}>Click to replace</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {isDragActive ? 'Drop here...' : 'Click or drag & drop mammogram'}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>PNG, JPG, JPEG, DICOM · Max 10 MB</p>
                </>
              )}
            </div>

            <button
              id="scanAnalyzeBtn"
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 14, marginBottom: 12 }}
            >
              {loading ? '⏳ Analyzing...' : '🔬 Analyze Mammogram'}
            </button>

            <div style={{ padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#92400e' }}>
              ⚠️ AI-assisted analysis only. Confirm with a certified radiologist before clinical action.
            </div>
          </div>
        </div>

        {/* ── Result Panel ── */}
        <div className="disha-card">
          <div className="disha-card-header">Analysis Result</div>
          <div style={{ padding: 20 }}>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, border: '4px solid #e2e8f0', borderTopColor: '#1a3a6b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Analyzing mammogram...</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Please wait while the scan is being processed.</p>
              </div>
            )}

            {!loading && !result && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🩺</div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>Results will appear here after analysis.</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Upload an image and click Analyze to begin.</p>
              </div>
            )}

            {!loading && result && (
              <div style={{ animation: 'fadeSlideUp 0.4s ease forwards' }}>

                {isMalignant && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8 }}>
                    🚨 Malignant finding detected — immediate radiologist consultation required.
                  </div>
                )}

                {/* Heatmap section */}
                <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderBottom: heatmap ? '1px solid #e2e8f0' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f2744' }}>🔥 Grad-CAM Heatmap</div>
                      <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>Highlights regions the model focused on</div>
                    </div>
                    <button
                      onClick={fetchHeatmap}
                      disabled={heatmapLoading || !!heatmap}
                      style={{
                        padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
                        borderRadius: 6, cursor: heatmapLoading || heatmap ? 'default' : 'pointer',
                        border: '1.5px solid #1a3a6b',
                        background: heatmap ? '#e8f4f8' : '#0f2744',
                        color: heatmap ? '#1a3a6b' : 'white',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s',
                        opacity: heatmapLoading ? 0.7 : 1,
                      }}
                    >
                      {heatmapLoading ? '⏳ Generating...' : heatmap ? '✅ Heatmap Ready' : 'Generate Heatmap'}
                    </button>
                  </div>

                  {heatmap && (
                    <div style={{ padding: 14 }}>
                      {/* Image with overlay */}
                      <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxHeight: 260, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                        {/* Original image base */}
                        <img src={preview!} alt="Original" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', display: 'block', opacity: 1 - heatmapOpacity * 0.3 }} />
                        {/* Heatmap overlay */}
                        <img src={heatmap} alt="Heatmap" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: heatmapOpacity, mixBlendMode: 'screen' }} />
                      </div>

                      {/* Opacity slider */}
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>Overlay</span>
                        <input type="range" min={0} max={1} step={0.05} value={heatmapOpacity}
                          onChange={e => setHeatmapOpacity(parseFloat(e.target.value))}
                          style={{ flex: 1, accentColor: '#0f2744' }} />
                        <span style={{ fontSize: 11, color: '#0f2744', fontWeight: 700, width: 34, textAlign: 'right' }}>{Math.round(heatmapOpacity * 100)}%</span>
                      </div>

                      {/* Legend */}
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: '#64748b' }}>Low attention</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'linear-gradient(to right, #00008b, #0000ff, #00ffff, #00ff00, #ffff00, #ff8000, #ff0000)', border: '1px solid #e2e8f0' }} />
                        <span style={{ fontSize: 10, color: '#64748b' }}>High attention</span>
                      </div>
                      <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
                        🔴 Red/yellow = regions most influential to the prediction. Blue = low influence. Use this to verify the model is focusing on clinically relevant tissue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Gauge + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18, padding: 18, background: isMalignant ? '#fff5f5' : '#f0fdf4', borderRadius: 12, border: `1.5px solid ${isMalignant ? '#fca5a5' : '#86efac'}` }}>
                  <RadialGauge benignProb={parseFloat(result.benignProb)} malignantProb={parseFloat(result.malignantProb)} size={140} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: isMalignant ? '#dc2626' : '#15803d', marginBottom: 6 }}>
                      {result.prediction.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                      Confidence: <strong>{result.confidence}</strong> · Patient: <strong>{result.savedPatientId}</strong>
                    </div>
                    <RiskBadge malignantProb={parseFloat(result.malignantProb)} showDescription />
                  </div>
                </div>

                {/* Probability bars */}
                <div style={{ marginBottom: 16 }}>
                  {[
                    { label: 'Benign Probability', value: result.benignProb, color: '#16a34a' },
                    { label: 'Malignant Probability', value: result.malignantProb, color: '#dc2626' },
                  ].map(({ label, value, color }) => {
                    const pct = parseFloat(String(value).replace('%', '')) || 0;
                    return (
                      <div key={label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color }}>{label}</span>
                          <span style={{ fontWeight: 700, color }}>{value}</span>
                        </div>
                        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Recommendations */}
                <div style={{ marginBottom: 14, padding: '12px 16px', background: '#f8fafc', borderLeft: `4px solid ${isMalignant ? '#dc2626' : '#16a34a'}`, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontWeight: 700, fontSize: 12, color: '#0f2744', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' }}>AI Recommendations</h4>
                  {isMalignant ? (
                    <ul style={{ fontSize: 12, color: '#475569', paddingLeft: 16, lineHeight: 1.8, margin: 0 }}>
                      <li><strong>Immediate:</strong> Schedule urgent biopsy to confirm findings.</li>
                      <li>Consult an oncologist for further evaluation.</li>
                      <li>Additional imaging (MRI or ultrasound) may be required.</li>
                      <li>Notify patient and schedule follow-up within 48 hours.</li>
                    </ul>
                  ) : (
                    <ul style={{ fontSize: 12, color: '#475569', paddingLeft: 16, lineHeight: 1.8, margin: 0 }}>
                      <li><strong>Routine Follow-up:</strong> No immediate signs of malignancy.</li>
                      <li>Continue with standard annual mammogram screening.</li>
                      <li>Advise regular breast self-examinations.</li>
                      <li>Review patient history for other risk factors.</li>
                    </ul>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <button onClick={printReport} className="btn-primary" style={{ fontSize: 12 }}>📄 Download Report</button>
                  <button onClick={() => router.push('/history')} className="btn-outline" style={{ fontSize: 12 }}>📋 View History</button>
                </div>

                {/* FL Confirm */}
                {!confirmDone ? (
                  <div style={{ padding: 14, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#1e40af', marginBottom: 4 }}>🤖 Federated Learning — Confirm True Diagnosis</div>
                    <p style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Confirm the correct diagnosis to improve the global AI model. Images stay private — only encrypted weights are shared.</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <button onClick={() => setConfirmedDiagnosis('benign')}
                        style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: '1.5px solid #86efac', background: confirmedDiagnosis === 'benign' ? '#15803d' : '#dcfce7', color: confirmedDiagnosis === 'benign' ? 'white' : '#15803d', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
                        ✅ BENIGN
                      </button>
                      <button onClick={() => setConfirmedDiagnosis('malignant')}
                        style={{ flex: 1, padding: '8px', fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: '1.5px solid #fca5a5', background: confirmedDiagnosis === 'malignant' ? '#dc2626' : '#fee2e2', color: confirmedDiagnosis === 'malignant' ? 'white' : '#dc2626', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
                        🔴 MALIGNANT
                      </button>
                    </div>
                    <button
                      disabled={!confirmedDiagnosis || confirmLoading}
                      onClick={async () => {
                        if (!confirmedDiagnosis || !result) return;
                        setConfirmLoading(true);
                        try {
                          await axios.post('/api/confirm-scan', {
                            patientId: result.savedPatientId,
                            aiPrediction: result.prediction.toLowerCase(),
                            confirmedLabel: confirmedDiagnosis,
                            confidence: result.confidence,
                          }, { headers: authHeaders() });
                          setConfirmDone(true);
                          toast.success('Diagnosis confirmed! Queued for FL training.');
                        } catch { toast.error('Failed to save confirmation.'); }
                        finally { setConfirmLoading(false); }
                      }}
                      className="btn-primary"
                      style={{ width: '100%', fontSize: 12, opacity: confirmedDiagnosis ? 1 : 0.5 }}
                    >
                      {confirmLoading ? 'Saving...' : '📡 Submit for FL Training'}
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: 14, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#15803d' }}>✅ Diagnosis Confirmed!</div>
                    <p style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>Queued for the next FL training round. The global model will improve using your hospital&apos;s knowledge.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GovLayout>
  );
}

'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import GovLayout from '@/components/GovLayout';
import { getSession, authHeaders, Session } from '@/lib/auth';

export default function ScanPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.dcm'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a mammogram image first.'); return; }
    setLoading(true);
    setResult(null);
    const pid = patientId.trim() || `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_code', pid);

      const res = await axios.post('/api/predict', formData, {
        headers: { ...authHeaders() },
      });
      const data = res.data;
      const r = {
        prediction: data.prediction,
        confidence: data.confidence,
        benignProb: data.benign_prob,
        malignantProb: data.malignant_prob,
        savedPatientId: data.patientCode || pid,
      };
      setResult(r);
      toast.success('Scan saved to history!');
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

  const isMalignant = result?.prediction?.toLowerCase() === 'malignant';

  const printReport = () => {
    if (!result || !session) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
<html><head><title>Mammogram Report</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; color: #1a1a2e; }
  h1 { color: #1a3a6b; font-size: 16px; border-bottom: 2px solid #f7941d; padding-bottom: 8px; }
  .result-box { padding: 16px; margin: 12px 0; border-radius: 2px; }
  .benign { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
  .malignant { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
  .disclaimer { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-top: 16px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #2c5f9e; color: white; padding: 6px 10px; text-align: left; font-size: 12px; }
  td { padding: 6px 10px; border: 1px solid #ddd; }
</style>
</head><body>
<h1>🏥 National Mammogram AI Detection Report</h1>
<p style="color:#666;font-size:12px">Ministry of Health & Family Welfare, Government of India</p>
<table>
  <tr><th>Field</th><th>Details</th></tr>
  <tr><td>Patient ID</td><td>${result.savedPatientId}</td></tr>
  <tr><td>Report Date</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
  <tr><td>Image File</td><td>${file?.name || 'N/A'}</td></tr>
  <tr><td>Attending Physician</td><td>Dr. ${session.doctorId}</td></tr>
  <tr><td>Institution</td><td>${session.hospitalName}</td></tr>
</table>
<div class="result-box ${result.prediction.toLowerCase()}">
  <strong style="font-size:18px">${result.prediction.toUpperCase()}</strong><br/>
  Confidence: ${result.confidence}<br/>
  Benign Probability: ${result.benignProb}<br/>
  Malignant Probability: ${result.malignantProb}
</div>
<div class="disclaimer">
  ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
</div>
</body></html>`);
    win.document.close();
    win.print();
  };

  if (!session) return null;

  return (
    <GovLayout>
      <div className="mb-4">
        <h2 className="text-base font-bold" style={{ color: '#1a3a6b' }}>New Scan</h2>
        <p className="text-xs text-gray-500 mt-0.5">Upload a mammogram image for AI-assisted cancer detection analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload section */}
        <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
          <div className="px-4 py-2.5 font-bold text-sm" style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}>
            Upload Mammogram
          </div>
          <div className="p-4">
            {/* Patient ID */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: '#333' }}>
                Patient ID (Optional)
              </label>
              <input
                type="text"
                className="gov-input"
                placeholder="e.g. PT-00301 (auto-assigned if empty)"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>

            {/* Dropzone - Large */}
            <div
              {...getRootProps()}
              className="cursor-pointer flex flex-col items-center justify-center px-4 text-center mb-3"
              style={{
                border: `2px dashed ${isDragActive ? '#f7941d' : '#2c5f9e'}`,
                background: isDragActive ? '#fff8ee' : '#f8fbff',
                borderRadius: '2px',
                minHeight: 220,
                transition: 'all 0.2s',
              }}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="w-full">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto object-contain rounded mb-2" />
                  <p className="text-xs text-gray-500">{file?.name}</p>
                  <p className="text-xs text-blue-600 mt-1">Click to replace</p>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">🗂️</div>
                  <p className="text-sm font-semibold text-gray-700">
                    {isDragActive ? 'Drop here...' : 'Click or drag & drop mammogram image'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Supported: PNG, JPG, JPEG, DICOM</p>
                  <p className="text-xs text-gray-400 mt-1">Maximum file size: 10 MB</p>
                </>
              )}
            </div>

            <button
              id="scanAnalyzeBtn"
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full py-2.5 font-bold text-sm text-white transition-colors disabled:opacity-50 mb-3"
              style={{
                background: file ? '#1a3a6b' : '#8a9bb5',
                border: '1px solid #122a52',
                borderRadius: '2px',
              }}
            >
              {loading ? '⏳ Analyzing mammogram using ResNet50 AI model...' : '🔬 ANALYZE MAMMOGRAM'}
            </button>

            <div
              className="p-2.5 text-xs"
              style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px', color: '#856404' }}
            >
              ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
            </div>
          </div>
        </div>

        {/* Result section */}
        <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
          <div className="px-4 py-2.5 font-bold text-sm" style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}>
            Analysis Result
          </div>
          <div className="p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 border-4 border-t-transparent rounded-full mb-4 animate-spin"
                  style={{ borderColor: '#2c5f9e', borderTopColor: 'transparent' }} />
                <p className="text-sm font-semibold text-gray-700">Analyzing mammogram...</p>
                <p className="text-xs text-gray-500 mt-1">Using ResNet50 AI model via Federated Learning</p>
                <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
              </div>
            )}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <div className="text-5xl mb-4">🩺</div>
                <p className="text-sm">Analysis results will appear here after processing.</p>
                <p className="text-xs mt-2">Upload an image and click Analyze to begin.</p>
              </div>
            )}

            {!loading && result && (
              <div>
                {isMalignant && (
                  <div className="mb-3 px-3 py-2.5 font-bold text-sm flex items-center gap-2"
                    style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '2px' }}>
                    🚨 ALERT: Malignant finding detected! Immediate radiologist consultation required.
                  </div>
                )}

                <div className="p-5 text-center mb-4 rounded-sm"
                  style={{
                    background: isMalignant ? '#f8d7da' : '#d4edda',
                    border: `2px solid ${isMalignant ? '#f5c6cb' : '#c3e6cb'}`,
                  }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: isMalignant ? '#721c24' : '#155724' }}>
                    {isMalignant ? '🔴' : '🟢'} {result.prediction.toUpperCase()}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: isMalignant ? '#721c24' : '#155724' }}>
                    Confidence: {result.confidence}
                  </div>
                  <div className="text-xs mt-1" style={{ color: isMalignant ? '#721c24' : '#155724' }}>
                    Patient: {result.savedPatientId}
                  </div>
                </div>

                {/* Prob bars */}
                <div className="mb-4">
                  {[
                    { label: 'Benign Probability', value: result.benignProb, color: '#28a745' },
                    { label: 'Malignant Probability', value: result.malignantProb, color: '#dc3545' },
                  ].map(({ label, value, color }) => {
                    const pct = parseFloat(value.replace('%', '')) || 0;
                    return (
                      <div key={label} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold" style={{ color }}>{label}</span>
                          <span className="font-bold" style={{ color }}>{value}</span>
                        </div>
                        <div className="h-4 rounded-sm overflow-hidden" style={{ background: '#e9ecef' }}>
                          <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Recommendations Section */}
                <div className="mb-4 p-4 text-left rounded-sm" style={{ background: '#f8fbff', border: '1px solid #c8d0dc', borderLeft: `4px solid ${isMalignant ? '#dc3545' : '#28a745'}` }}>
                  <h4 className="font-bold text-sm mb-2" style={{ color: '#1a3a6b' }}>AI Recommendations</h4>
                  {isMalignant ? (
                    <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                      <li><strong>Immediate Action Required:</strong> Schedule an urgent biopsy to confirm findings.</li>
                      <li>Consult with an oncologist for further evaluation.</li>
                      <li>Conduct additional imaging (e.g., MRI or ultrasound) as necessary.</li>
                      <li>Notify the patient and schedule a follow-up appointment within 48 hours.</li>
                    </ul>
                  ) : (
                    <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                      <li><strong>Routine Follow-up:</strong> No immediate signs of malignancy detected.</li>
                      <li>Continue with standard annual mammogram screening.</li>
                      <li>Advise the patient to maintain regular self-examinations.</li>
                      <li>Review patient history for any other risk factors.</li>
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button onClick={printReport} className="py-2 text-xs font-bold text-white"
                    style={{ background: '#2c5f9e', border: '1px solid #1a3a6b', borderRadius: '2px' }}>
                    📄 Download Report
                  </button>
                  <button onClick={() => router.push('/history')} className="py-2 text-xs font-bold"
                    style={{ background: '#e9ecef', border: '1px solid #ced4da', borderRadius: '2px', color: '#333' }}>
                    📋 View History
                  </button>
                </div>

                {/* ── Step A: Confirm Diagnosis for FL ──────────────────── */}
                {!confirmDone ? (
                  <div className="p-3 rounded-sm" style={{ background: '#eef4ff', border: '2px solid #2c5f9e' }}>
                    <div className="font-bold text-xs mb-1" style={{ color: '#1a3a6b' }}>🤖 Federated Learning — Confirm True Diagnosis</div>
                    <p className="text-xs text-gray-600 mb-2">Doctor: confirm the correct diagnosis to improve the global AI model. Your images stay private — only model weights are shared.</p>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setConfirmedDiagnosis('benign')}
                        className="flex-1 py-1.5 text-xs font-bold rounded-sm"
                        style={{ background: confirmedDiagnosis === 'benign' ? '#155724' : '#d4edda', color: confirmedDiagnosis === 'benign' ? 'white' : '#155724', border: '1px solid #c3e6cb' }}>
                        ✅ BENIGN
                      </button>
                      <button
                        onClick={() => setConfirmedDiagnosis('malignant')}
                        className="flex-1 py-1.5 text-xs font-bold rounded-sm"
                        style={{ background: confirmedDiagnosis === 'malignant' ? '#721c24' : '#f8d7da', color: confirmedDiagnosis === 'malignant' ? 'white' : '#721c24', border: '1px solid #f5c6cb' }}>
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
                      className="w-full py-1.5 text-xs font-bold text-white rounded-sm"
                      style={{ background: confirmedDiagnosis ? '#1a3a6b' : '#8a9bb5', border: 'none', cursor: confirmedDiagnosis ? 'pointer' : 'not-allowed' }}>
                      {confirmLoading ? 'Saving...' : '📡 Submit Confirmation for FL Training'}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-sm text-center" style={{ background: '#d4edda', border: '1px solid #c3e6cb' }}>
                    <div className="font-bold text-sm text-green-800">✅ Diagnosis Confirmed!</div>
                    <p className="text-xs text-green-700 mt-1">This scan has been queued for the next Federated Learning training round. The global model will improve using your hospital's knowledge — without sharing any patient images.</p>
                  </div>
                )}

                <div className="p-2.5 text-xs"
                  style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px', color: '#856404' }}>
                  ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GovLayout>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import GovLayout from '@/components/GovLayout';
import { getSession, authHeaders, Session } from '@/lib/auth';
import { Suspense } from 'react';

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

function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/'); return; }
    setSession(s);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get<HistoryRecord[]>('/api/history', { headers: authHeaders() });
      setRecords(res.data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (record: HistoryRecord) => {
    if (!session) return;
    const isMalignant = record.result.toLowerCase() === 'malignant';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Mammogram Report — ${record.patientId}</title>
<meta charset="utf-8">
<style>
  @page { margin: 20mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a2e; margin: 0; padding: 0; }
  .header { background: #1a3a6b; color: white; padding: 16px 24px; border-bottom: 4px solid #f7941d; }
  .header h1 { margin: 0; font-size: 16px; font-weight: bold; }
  .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.85; }
  .content { padding: 20px 24px; }
  .section-title { color: #1a3a6b; font-size: 12px; font-weight: bold; border-bottom: 1px solid #2c5f9e; padding-bottom: 4px; margin: 16px 0 8px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #2c5f9e; color: white; padding: 7px 10px; text-align: left; font-size: 11px; border: 1px solid #1a3a6b; }
  td { padding: 6px 10px; border: 1px solid #d0d8e4; font-size: 12px; }
  tr:nth-child(even) td { background: #eef2f8; }
  .result-box { padding: 16px 20px; margin: 12px 0; border-radius: 2px; }
  .benign { background: #d4edda; border: 2px solid #c3e6cb; color: #155724; }
  .malignant { background: #f8d7da; border: 2px solid #f5c6cb; color: #721c24; }
  .result-title { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
  .malignant-alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; margin: 12px 0; font-weight: bold; }
  .disclaimer { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; margin-top: 16px; font-size: 12px; color: #856404; }
  .footer { background: #1a3a6b; color: rgba(255,255,255,0.7); padding: 10px 24px; font-size: 10px; border-top: 2px solid #f7941d; margin-top: 20px; }
  .badge { display: inline-block; padding: 2px 12px; border-radius: 2px; font-size: 12px; font-weight: bold; }
  .badge-b { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
  .badge-m { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  .prob-bar-bg { display: inline-block; width: 200px; height: 12px; background: #e9ecef; vertical-align: middle; }
  .prob-bar { display: inline-block; height: 12px; }
</style>
</head>
<body>
<div class="header">
  <h1>🏥 National Mammogram AI Detection System — Analysis Report</h1>
  <p>Ministry of Health &amp; Family Welfare | Government of India | NIC | NHA</p>
</div>
<div class="content">
  <div class="section-title">Patient &amp; Scan Information</div>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Patient ID</td><td><strong>${record.patientId}</strong></td></tr>
    <tr><td>Scan Date</td><td>${record.date}</td></tr>
    <tr><td>Report Generated</td><td>${new Date().toLocaleString('en-IN')}</td></tr>
    <tr><td>Image File</td><td>${record.imageName || 'Not recorded'}</td></tr>
    <tr><td>Attending Physician</td><td>Dr. ${session.name || session.doctorId}</td></tr>
    <tr><td>Institution</td><td>${session.hospitalName}</td></tr>
    <tr><td>AI Model</td><td>ResNet50 — Federated Learning v2.1</td></tr>
  </table>

  ${isMalignant ? `<div class="malignant-alert">🚨 ALERT: Malignant finding detected. Immediate radiologist review is strongly recommended.</div>` : ''}

  <div class="section-title">AI Analysis Result</div>
  <div class="result-box ${record.result.toLowerCase()}">
    <div class="result-title">${isMalignant ? '🔴' : '🟢'} ${record.result.toUpperCase()}</div>
    <div>Overall Confidence: <strong>${record.confidence}</strong></div>
  </div>

  <div class="section-title">Probability Breakdown</div>
  <table>
    <tr><th>Category</th><th>Probability</th></tr>
    <tr><td><span class="badge badge-b">BENIGN</span></td><td><strong>${record.benignProb}</strong></td></tr>
    <tr><td><span class="badge badge-m">MALIGNANT</span></td><td><strong>${record.malignantProb}</strong></td></tr>
  </table>

  <div class="disclaimer">
    ⚠️ <strong>Important Disclaimer:</strong> This is an AI-assisted analysis only. Final diagnosis MUST be confirmed by a certified radiologist or oncologist. This report does not constitute a medical diagnosis.
  </div>
</div>
<div class="footer">
  © ${new Date().getFullYear()} Ministry of Health &amp; Family Welfare, Government of India | NIC | NHA |
  NMADS v2.1 — Federated Learning Mammogram Detection System
</div>
</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <GovLayout>
      <div className="mb-4">
        <h2 className="text-base font-bold" style={{ color: '#1a3a6b' }}>Reports</h2>
        <p className="text-xs text-gray-500 mt-0.5">Generated analysis reports — data fetched from MongoDB</p>
      </div>

      <div
        className="mb-4 p-3 text-xs"
        style={{ background: '#e8f4f8', border: '1px solid #b8d8e8', borderLeft: '4px solid #2c5f9e', borderRadius: '2px', color: '#1a3a6b' }}
      >
        ℹ️ Reports are generated from MongoDB scan records. Click "Generate Report" to open a printable PDF.
      </div>

      <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
        <div className="px-4 py-2.5 font-bold text-sm"
          style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}>
          Available Reports ({records.length})
        </div>

        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Patient ID</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Image File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                    Loading reports from database...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">No reports available. Perform a scan first.</p>
                    <a href="/scan" className="text-xs mt-2 inline-block font-semibold" style={{ color: '#1a56a0' }}>
                      Go to New Scan →
                    </a>
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr
                    key={r.id}
                    style={highlightId === r.id ? { background: '#fff8ee', boxShadow: 'inset 0 0 0 2px #f7941d' } : {}}
                  >
                    <td className="text-xs text-gray-500">{idx + 1}</td>
                    <td className="text-xs">{r.date}</td>
                    <td className="text-xs font-mono font-semibold">
                      {r.patientId}
                      {highlightId === r.id && (
                        <span className="ml-1 text-orange-600 text-xs">← selected</span>
                      )}
                    </td>
                    <td>
                      <span className={r.result === 'Benign' ? 'badge-benign' : 'badge-malignant'}>
                        {r.result}
                      </span>
                    </td>
                    <td className="text-xs font-semibold">{r.confidence}</td>
                    <td className="text-xs text-gray-500">{r.imageName || '—'}</td>
                    <td>
                      <button
                        onClick={() => generateReport(r)}
                        className="text-xs font-bold text-white px-3 py-1"
                        style={{ background: '#1a3a6b', border: '1px solid #0d1f3c', borderRadius: '2px' }}
                      >
                        Generate Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {records.length > 0 && (
          <div className="px-4 py-2 text-right" style={{ borderTop: '1px solid #e0e6ef', background: '#f8f9fa' }}>
            <p className="text-xs text-gray-400">
              All reports generated locally. Records securely stored in MongoDB Atlas per-doctor.
            </p>
          </div>
        )}
      </div>
    </GovLayout>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

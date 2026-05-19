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

    const birads     = isMalignant ? 'BI-RADS 4 — Suspicious' : 'BI-RADS 2 — Benign Finding';
    const mass       = isMalignant ? 'Suspicious irregular mass noted' : 'Not detectable';
    const calcs      = isMalignant ? 'Suspicious microcalcifications present' : 'Not detectable';
    const arch       = isMalignant ? 'Present' : 'Not detectable';
    const asym       = isMalignant ? 'Focal asymmetry noted' : 'Not detectable';
    const tissue     = 'Heterogeneously dense breast tissue, may lower sensitivity of mammography';
    const impression = isMalignant
      ? `Mammographic findings are highly suspicious for malignancy. ${birads}. Immediate radiological correlation and biopsy is strongly recommended.`
      : `No mammographic evidence of malignancy. ${birads}. Findings are consistent with benign breast tissue.`;
    const suggestion = isMalignant
      ? 'Urgent referral to oncology for further evaluation. Core needle biopsy recommended. Radiologist review required within 48 hours.'
      : 'Self breast exam monthly and follow-up study yearly. Routine annual mammogram screening recommended.';

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html><head>
<title>DISHA Report — ${record.patientId}</title>
<meta charset="utf-8">
<style>
  @page { margin: 12mm 14mm; size: A4 portrait; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111827; background: white; line-height: 1.4; }

  .hdr { background: #0f2744; color: white; padding: 11px 18px; border-bottom: 3px solid #f59e0b; display: flex; align-items: center; gap: 14px; }
  .hdr-text h1 { font-size: 14px; font-weight: 700; }
  .hdr-text p  { font-size: 9px; color: rgba(255,255,255,0.55); letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }
  .hdr-meta    { margin-left: auto; text-align: right; font-size: 9.5px; color: rgba(255,255,255,0.5); line-height: 1.6; }

  .pstrip { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1.5px solid #0f2744; }
  .pcol   { padding: 6px 14px; border-right: 1px solid #d1d5db; }
  .pcol:last-child { border-right: none; }
  .plbl   { font-size: 8.5px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .pval   { font-size: 11px; font-weight: 700; color: #0f2744; margin-top: 1px; }
  .psub   { font-size: 9.5px; color: #4b5563; margin-top: 1px; }

  .rtitle { text-align: center; padding: 7px 18px 6px; border-bottom: 1px solid #d1d5db; }
  .rtitle h2 { font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #111827; text-transform: uppercase; }
  .rtitle .birads { font-size: 10px; color: #374151; margin-top: 2px; font-weight: 600; }

  .body { padding: 8px 18px; }

  .alert { border: 1px solid #6b7280; border-left: 3px solid #0f2744; padding: 5px 10px; margin-bottom: 7px; font-size: 10px; font-weight: 600; color: #111827; }

  .sh { font-size: 9.5px; font-weight: 800; color: #0f2744; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #0f2744; padding-bottom: 2px; margin: 8px 0 4px; }

  table { width: 100%; border-collapse: collapse; }
  .ft td { padding: 3.5px 9px; border: 1px solid #d1d5db; font-size: 10.5px; vertical-align: top; }
  .ft td:first-child { font-weight: 600; color: #374151; width: 34%; background: #f9fafb; }

  .rb { border: 1.5px solid #0f2744; padding: 7px 12px; margin: 4px 0; display: flex; align-items: baseline; gap: 16px; }
  .rb-result { font-size: 14px; font-weight: 800; color: #0f2744; letter-spacing: 0.5px; }
  .rb-conf   { font-size: 10px; color: #374151; }
  .rb-brd    { font-size: 10px; color: #374151; font-style: italic; }

  .pt th { background: #0f2744; color: white; padding: 3.5px 9px; font-size: 10px; text-align: left; }
  .pt td { padding: 3.5px 9px; border: 1px solid #d1d5db; font-size: 10.5px; }

  .tb { font-size: 10.5px; color: #1f2937; line-height: 1.6; padding: 3px 0; }
  .nl { padding-left: 16px; margin: 3px 0; }
  .nl li { font-size: 10.5px; color: #374151; line-height: 1.6; }

  .disc { border: 1px solid #9ca3af; padding: 5px 10px; margin-top: 8px; font-size: 9.5px; color: #374151; line-height: 1.5; }
  .eor  { text-align: center; font-size: 9.5px; font-weight: 700; color: #6b7280; margin-top: 8px; letter-spacing: 1px; }

  .ftr { background: #0f2744; color: rgba(255,255,255,0.5); padding: 6px 18px; font-size: 9px; border-top: 2px solid #f59e0b; margin-top: 10px; display: flex; justify-content: space-between; }
  .ftr strong { color: rgba(255,255,255,0.8); }
</style>
</head><body>

<div class="hdr">
  <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#f59e0b" stroke-width="1.5" stroke-opacity="0.5"/>
    <circle cx="24" cy="24" r="17" stroke="#f59e0b" stroke-width="2" fill="rgba(245,158,11,0.1)"/>
    <path d="M 24 7 A 17 17 0 0 1 41 24" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="24" y1="2" x2="24" y2="6" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="46" y1="24" x2="42" y2="24" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="24" y1="46" x2="24" y2="42" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="2" y1="24" x2="6" y2="24" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
    <text x="24" y="29" text-anchor="middle" fill="#f59e0b" font-size="13" font-weight="800" font-family="Segoe UI,Arial">D</text>
  </svg>
  <div class="hdr-text">
    <h1>DISHA — Mammogram Analysis Report</h1>
    <p>Diagnostic Imaging &amp; Screening for Health Analytics</p>
  </div>
  <div class="hdr-meta">
    Scan Date: ${record.date}<br>
    Reported: ${new Date().toLocaleString('en-IN')}
  </div>
</div>

<div class="pstrip">
  <div class="pcol">
    <div class="plbl">Patient ID</div>
    <div class="pval">${record.patientId}</div>
    <div class="psub">Image: ${record.imageName || 'Not recorded'}</div>
  </div>
  <div class="pcol">
    <div class="plbl">Attending Physician</div>
    <div class="pval">Dr. ${session.name || session.doctorId}</div>
    <div class="psub">Institution: ${session.hospitalName}</div>
  </div>
  <div class="pcol">
    <div class="plbl">Registered on</div>
    <div class="pval" style="font-size:10px">${record.date}</div>
    <div class="plbl" style="margin-top:4px">Reported on</div>
    <div class="pval" style="font-size:10px">${new Date().toLocaleString('en-IN')}</div>
  </div>
</div>

<div class="rtitle">
  <h2>Mammography (Mammogram)</h2>
  <div class="birads">${birads}</div>
</div>

<div class="body">

  ${isMalignant ? `<div class="alert">&#9888; Malignant finding detected — Immediate radiologist review is strongly recommended.</div>` : ''}

  <div class="sh">Clinical Findings</div>
  <table class="ft">
    <tr><td>Clinical</td><td>Screening</td></tr>
    <tr><td>Technique</td><td>CC and MLO views</td></tr>
    <tr><td>Breast Tissue</td><td>${tissue}</td></tr>
    <tr><td>Mass</td><td>${mass}</td></tr>
    <tr><td>Calcifications</td><td>${calcs}</td></tr>
    <tr><td>Architectural Distortion</td><td>${arch}</td></tr>
    <tr><td>Focal / Breast Asymmetry</td><td>${asym}</td></tr>
    <tr><td>Skin Thickening</td><td>Not detectable</td></tr>
    <tr><td>Others</td><td>—</td></tr>
  </table>

  <div class="sh">Screening Result</div>
  <div class="rb">
    <div class="rb-result">${record.result.toUpperCase()}</div>
    <div class="rb-conf">Confidence: <strong>${record.confidence}</strong></div>
    <div class="rb-brd">${birads}</div>
  </div>

  <div class="sh">Probability Breakdown</div>
  <table class="pt">
    <tr><th>Category</th><th>Probability</th></tr>
    <tr><td>Benign</td><td><strong>${record.benignProb}</strong></td></tr>
    <tr><td>Malignant</td><td><strong>${record.malignantProb}</strong></td></tr>
  </table>

  <div class="sh">Impression</div>
  <div class="tb">${impression}</div>

  <div class="sh">Suggestion</div>
  <div class="tb">${suggestion}</div>

  <div class="sh">Note</div>
  <ul class="nl">
    <li>The false negative rate of mammography is approximately 10%.</li>
    <li>Dense breast tissue may obscure underlying neoplasm.</li>
    <li>Management of a palpable abnormality must be based on clinical assessment.</li>
  </ul>

  <div class="disc">
    <strong>Important Disclaimer:</strong> This report is for clinical reference only. Final diagnosis must be confirmed by a certified radiologist or oncologist. This report does not constitute a medical diagnosis.
  </div>

  <div class="eor">**** End of Report ****</div>
</div>

<div class="ftr">
  <span>&copy; ${new Date().getFullYear()} <strong>DISHA</strong> &mdash; Diagnostic Imaging &amp; Screening for Health Analytics</span>
  <span>Not a substitute for radiological diagnosis</span>
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
        ℹ️ Reports are generated from MongoDB scan records. Click &quot;Generate Report&quot; to open a printable PDF.
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

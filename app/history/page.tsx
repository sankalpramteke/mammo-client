'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import GovLayout from '@/components/GovLayout';
import { getSession, authHeaders } from '@/lib/auth';

type Filter = 'All' | 'Benign' | 'Malignant';

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

export default function HistoryPage() {
  const router = useRouter();
  const [allRecords, setAllRecords] = useState<HistoryRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/'); return; }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingRecords(true);
    try {
      const res = await axios.get<HistoryRecord[]>('/api/history', { headers: authHeaders() });
      setAllRecords(res.data);
    } catch {
      setAllRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const filtered = allRecords.filter(r => {
    const matchesFilter = filter === 'All' || r.result === filter;
    const matchesSearch = !search || r.patientId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    All: allRecords.length,
    Benign: allRecords.filter(r => r.result === 'Benign').length,
    Malignant: allRecords.filter(r => r.result === 'Malignant').length,
  };

  const exportCSV = () => {
    const header = 'Patient ID,Result,Confidence,Benign %,Malignant %,Image,Date';
    const rows = filtered.map(r =>
      `${r.patientId},${r.result},${r.confidence},${r.benignProb},${r.malignantProb},${r.imageName || 'N/A'},${r.date}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DISHA_scan_history_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = (record: HistoryRecord) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
<html><head><title>DISHA Report - ${record.patientId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  body { font-family: 'Inter', Arial, sans-serif; font-size: 13px; margin: 32px; color: #0f172a; }
  h1 { color: #0f2744; font-size: 18px; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
  .subtitle { color: #64748b; font-size: 11px; margin-bottom: 20px; }
  .result-box { padding: 16px; margin: 14px 0; border-radius: 10px; }
  .benign    { background: #dcfce7; border: 2px solid #86efac; color: #15803d; }
  .malignant { background: #fee2e2; border: 2px solid #fca5a5; color: #991b1b; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0; }
  th { background: #0f2744; color: white; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
  .disclaimer { background: #fffbeb; border: 1px solid #fde68a; padding: 12px; margin-top: 20px; font-size: 11px; border-radius: 8px; color: #92400e; }
</style>
</head><body>
<h1>🔬 DISHA Diagnostic Report</h1>
<p class="subtitle">Diagnostic Imaging &amp; Screening for Health Analytics</p>
<table>
  <tr><th>Field</th><th>Details</th></tr>
  <tr><td>Patient ID</td><td><strong>${record.patientId}</strong></td></tr>
  <tr><td>Scan Date</td><td>${record.date}</td></tr>
  <tr><td>Image File</td><td>${record.imageName || 'N/A'}</td></tr>
  <tr><td>AI Model</td><td>DISHA ResNet101 v2.0</td></tr>
</table>
<div class="result-box ${record.result.toLowerCase()}">
  <strong style="font-size:20px">${record.result.toUpperCase()}</strong><br/>
  <span style="font-size:13px;margin-top:6px;display:block">Confidence: ${record.confidence} | Benign: ${record.benignProb} | Malignant: ${record.malignantProb}</span>
</div>
<div class="disclaimer">⚠️ AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.</div>
</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <GovLayout>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f2744', margin: 0 }}>Scan History</h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{allRecords.length} total scans recorded for your account</p>
        </div>
        <button onClick={exportCSV} className="btn-outline" style={{ fontSize: 12, gap: 6 }}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Search + Filter pills */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 280 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
          <input
            type="text"
            className="disha-input"
            placeholder="Search by Patient ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['All', 'Benign', 'Malignant'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: '1.5px solid',
                transition: 'all 0.18s',
                fontFamily: 'Inter, sans-serif',
                borderColor: filter === f
                  ? (f === 'Malignant' ? '#fca5a5' : f === 'Benign' ? '#86efac' : '#c7d2fe')
                  : '#e2e8f0',
                background: filter === f
                  ? (f === 'Malignant' ? '#fee2e2' : f === 'Benign' ? '#dcfce7' : '#eef2ff')
                  : 'white',
                color: filter === f
                  ? (f === 'Malignant' ? '#991b1b' : f === 'Benign' ? '#15803d' : '#3730a3')
                  : '#64748b',
              }}
            >
              {f} <span style={{ fontWeight: 500, opacity: 0.7 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="disha-card" style={{ overflow: 'hidden' }}>
        {loadingRecords ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <p style={{ fontSize: 13 }}>Loading scan history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>No records found</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              {search ? 'Try a different search term.' : 'No scans recorded yet. Start a new scan.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="disha-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient ID</th>
                  <th>Result</th>
                  <th>Probability Breakdown</th>
                  <th>Image</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => {
                  const malPct = parseFloat(String(record.malignantProb).replace('%', '')) || 0;
                  const isMal = record.result === 'Malignant';
                  return (
                    <tr key={record.id}>
                      <td style={{ color: '#94a3b8', fontSize: 11 }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#0f2744' }}>{record.patientId}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span className={isMal ? 'badge-malignant' : 'badge-benign'}>
                            {record.result}
                          </span>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Confidence: {record.confidence}</span>
                        </div>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {/* Benign bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, width: 46 }}>Benign</span>
                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${parseFloat(String(record.benignProb).replace('%','')) || 0}%`, background: '#16a34a', borderRadius: 3, transition: 'width 0.8s' }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', width: 36, textAlign: 'right' }}>{record.benignProb}</span>
                          </div>
                          {/* Malignant bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600, width: 46 }}>Malig.</span>
                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${malPct}%`, background: malPct > 55 ? '#dc2626' : malPct > 30 ? '#f59e0b' : '#86efac', borderRadius: 3, transition: 'width 0.8s' }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: malPct > 55 ? '#dc2626' : malPct > 30 ? '#d97706' : '#16a34a', width: 36, textAlign: 'right' }}>{record.malignantProb}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.imageName || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{record.date}</td>
                      <td>
                        <button
                          onClick={() => printReport(record)}
                          style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#1a3a6b', fontFamily: 'Inter, sans-serif' }}
                        >
                          📄 Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </GovLayout>
  );
}

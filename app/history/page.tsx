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

  const filtered = allRecords.filter((r) => {
    const matchesFilter = filter === 'All' || r.result === filter;
    const matchesSearch = !search || r.patientId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const printReport = (record: HistoryRecord) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
<html><head><title>Report - ${record.patientId}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; }
  h1 { color: #1a3a6b; font-size: 16px; border-bottom: 2px solid #f7941d; padding-bottom: 8px; }
  .result-box { padding: 12px; margin: 12px 0; border-radius: 2px; }
  .benign { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
  .malignant { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
  .disclaimer { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-top: 12px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #2c5f9e; color: white; padding: 6px 10px; text-align: left; }
  td { padding: 6px 10px; border: 1px solid #ddd; }
</style>
</head><body>
<h1>🏥 National Mammogram AI Detection Report</h1>
<p style="color:#666;font-size:12px">Ministry of Health &amp; Family Welfare, Government of India</p>
<table>
  <tr><th>Field</th><th>Details</th></tr>
  <tr><td>Patient ID</td><td>${record.patientId}</td></tr>
  <tr><td>Scan Date</td><td>${record.date}</td></tr>
  <tr><td>Image File</td><td>${record.imageName || 'N/A'}</td></tr>
</table>
<div class="result-box ${record.result.toLowerCase()}">
  <strong style="font-size:16px">${record.result.toUpperCase()}</strong><br/>
  Confidence: ${record.confidence}<br/>
  Benign Probability: ${record.benignProb}<br/>
  Malignant Probability: ${record.malignantProb}
</div>
<div class="disclaimer">
  ⚠️ This is an AI-assisted analysis only. Final diagnosis must be confirmed by a certified radiologist.
</div>
</body></html>`);
    win.document.close();
    win.print();
  };

  const benignCount = allRecords.filter((r) => r.result === 'Benign').length;
  const malignantCount = allRecords.filter((r) => r.result === 'Malignant').length;

  return (
    <GovLayout>
      <div className="mb-4">
        <h2 className="text-base font-bold" style={{ color: '#1a3a6b' }}>Scan History</h2>
        <p className="text-xs text-gray-500 mt-0.5">Complete record of all mammogram analyses — stored in MongoDB</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Scans', value: allRecords.length, color: '#1a3a6b' },
          { label: 'Benign', value: benignCount, color: '#1a6b3a' },
          { label: 'Malignant', value: malignantCount, color: '#6b1a1a' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 text-center"
            style={{ background: color, border: '1px solid rgba(0,0,0,0.1)', borderLeft: '4px solid #f7941d', borderRadius: '2px' }}>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-white opacity-80 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          style={{ borderBottom: '1px solid #e0e6ef', background: '#f0f5ff' }}>
          {/* Filter buttons */}
          <div className="flex gap-1">
            {(['All', 'Benign', 'Malignant'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-bold border transition-colors"
                style={{
                  background: filter === f ? (f === 'Malignant' ? '#dc3545' : f === 'Benign' ? '#28a745' : '#1a3a6b') : 'white',
                  color: filter === f ? 'white' : '#333',
                  border: `1px solid ${filter === f ? 'transparent' : '#c8d0dc'}`,
                  borderRadius: '2px',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 sm:max-w-xs">
            <input
              type="text"
              className="gov-input text-xs"
              placeholder="Search by Patient ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="text-xs text-gray-500 ml-auto">
            Showing {filtered.length} of {allRecords.length} records
          </div>
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
                <th>Benign Prob.</th>
                <th>Malignant Prob.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingRecords ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                    Loading records from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-xs text-gray-500">{idx + 1}</td>
                    <td className="text-xs">{item.date}</td>
                    <td className="text-xs font-mono font-semibold">{item.patientId}</td>
                    <td>
                      <span className={item.result === 'Benign' ? 'badge-benign' : 'badge-malignant'}>
                        {item.result}
                      </span>
                    </td>
                    <td className="text-xs font-semibold">{item.confidence}</td>
                    <td className="text-xs">{item.benignProb}</td>
                    <td className="text-xs">{item.malignantProb}</td>
                    <td>
                      <button
                        onClick={() => printReport(item)}
                        className="text-xs font-semibold"
                        style={{ color: '#1a56a0', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Download Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {allRecords.length > 0 && (
          <div className="px-4 py-2 text-right" style={{ borderTop: '1px solid #e0e6ef', background: '#f8f9fa' }}>
            <p className="text-xs text-gray-400">
              Records stored in MongoDB Atlas. Data is secured per-doctor via JWT authentication.
            </p>
          </div>
        )}
      </div>
    </GovLayout>
  );
}

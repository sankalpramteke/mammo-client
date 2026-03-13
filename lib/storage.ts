// localStorage utilities for session management and scan history

export interface Session {
  hospitalName: string;
  doctorId: string;
}

export interface ScanRecord {
  id: string;
  date: string;
  patientId: string;
  result: string;
  confidence: string;
  benignProb: string;
  malignantProb: string;
  imageName?: string;
}

// --- Session ---
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('mammo_session');
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session: Session) {
  localStorage.setItem('mammo_session', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('mammo_session');
}

// --- Scan History ---
export function getScanHistory(): ScanRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('mammo_scan_history');
  return raw ? JSON.parse(raw) : [];
}

export function addScanRecord(record: Omit<ScanRecord, 'id' | 'date'>): ScanRecord {
  const history = getScanHistory();
  const newRecord: ScanRecord = {
    ...record,
    id: `PT-${String(Math.floor(10000 + Math.random() * 90000))}`,
    date: new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }),
  };
  history.unshift(newRecord);
  localStorage.setItem('mammo_scan_history', JSON.stringify(history));
  return newRecord;
}

export function getScanById(id: string): ScanRecord | undefined {
  return getScanHistory().find((r) => r.id === id);
}

// Seed demo data if empty
export function seedDemoData() {
  if (typeof window === 'undefined') return;
  const existing = getScanHistory();
  if (existing.length > 0) return;

  const demo: ScanRecord[] = [
    {
      id: 'PT-00291',
      date: '13 Mar 2026',
      patientId: 'PT-00291',
      result: 'Benign',
      confidence: '94.2%',
      benignProb: '94.2%',
      malignantProb: '5.8%',
    },
    {
      id: 'PT-00288',
      date: '12 Mar 2026',
      patientId: 'PT-00288',
      result: 'Malignant',
      confidence: '87.5%',
      benignProb: '12.5%',
      malignantProb: '87.5%',
    },
    {
      id: 'PT-00275',
      date: '11 Mar 2026',
      patientId: 'PT-00275',
      result: 'Benign',
      confidence: '91.1%',
      benignProb: '91.1%',
      malignantProb: '8.9%',
    },
  ];
  localStorage.setItem('mammo_scan_history', JSON.stringify(demo));
}

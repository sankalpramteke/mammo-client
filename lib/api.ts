import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Error helper
function isBackendOffline(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      !error.response
    );
  }
  return false;
}

export interface PredictResult {
  prediction: string;
  confidence: string;
  benign_prob: string;
  malignant_prob: string;
}

export interface TrainingStatus {
  current_round: number;
  total_rounds: number;
  accuracy_history: number[];
  status: string;
}

export interface ScanHistoryItem {
  id: string;
  date: string;
  patient_id: string;
  result: string;
  confidence: string;
}

export async function predictImage(file: File): Promise<PredictResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/predict', formData);
  return res.data;
}

export async function getTrainingStatus(): Promise<TrainingStatus> {
  const res = await api.get('/training-status');
  return res.data;
}

export async function getHistory(): Promise<ScanHistoryItem[]> {
  const res = await api.get('/history');
  return res.data;
}

export { isBackendOffline, BASE_URL };
export default api;

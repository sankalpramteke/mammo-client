'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GovLayout from '@/components/GovLayout';
import { getSession } from '@/lib/auth';

export default function HelpPage() {
  const router = useRouter();
  useEffect(() => {
    const s = getSession();
    if (!s) router.push('/');
  }, []);

  return (
    <GovLayout>
      <div className="mb-4">
        <h2 className="text-base font-bold" style={{ color: '#1a3a6b' }}>Help &amp; Documentation</h2>
        <p className="text-xs text-gray-500 mt-0.5">User guide for the National Mammogram AI Detection System</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          {
            title: '🔬 How to Perform a Scan',
            items: [
              'Navigate to "New Scan" from the top navigation',
              'Optionally enter the Patient ID (auto-assigned if left blank)',
              'Upload a PNG, JPG, or DICOM mammogram image by dragging or clicking',
              'Click "Analyze Mammogram" to submit for AI analysis',
              'Results will appear on the right panel showing Benign or Malignant',
              'Download the report using the "Download Report" button',
            ],
          },
          {
            title: '📊 Understanding Results',
            items: [
              'BENIGN (Green): No cancerous cells detected by the AI model',
              'MALIGNANT (Red): Potential cancerous cells detected — requires urgent review',
              'Confidence %: How certain the model is about the prediction',
              'Benign/Malignant Probability: Distribution of the prediction scores',
              'Higher confidence means the model is more certain of the result',
              'Always consult a certified radiologist for final diagnosis',
            ],
          },
          {
            title: '🔄 Federated Learning System',
            items: [
              'The AI model is trained across multiple hospitals without sharing raw data',
              'Each hospital trains locally and shares only model weights',
              'Global Model Accuracy improves with each training round',
              'Training status is visible on the Dashboard stat cards',
              'Data privacy is ensured via Differential Privacy techniques',
              'Model: ResNet50 — fine-tuned for mammogram classification',
            ],
          },
          {
            title: '📋 Reports &amp; History',
            items: [
              'All scans are stored locally in your browser (localStorage)',
              'Access Scan History from the top navigation to view all past scans',
              'Filter history by All / Benign / Malignant using the filter buttons',
              'Search by Patient ID in the search box',
              'Go to Reports to generate a printable PDF for any scan',
              'Reports include patient info, result, probability breakdown, and disclaimer',
            ],
          },
          {
            title: '⚙️ Backend Connection',
            items: [
              'The system requires FastAPI backend running on http://localhost:8000',
              'If backend is offline, you will see a warning banner on the Dashboard',
              'Ensure the FastAPI server is started before performing analysis',
              'API endpoints used: POST /predict, GET /training-status, GET /history',
              'Upload timeout is set to 30 seconds for large DICOM files',
            ],
          },
          {
            title: '⚠️ Important Disclaimers',
            items: [
              'This is an AI-assisted diagnostic support tool ONLY',
              'Not a substitute for professional medical diagnosis',
              'Final diagnosis MUST be confirmed by a certified radiologist',
              'For medical emergencies, contact your hospital emergency department',
              'Patient data is stored only in the local browser — not on any server',
              'Authorised medical personnel use only (IT Act 2000)',
            ],
          },
        ].map(({ title, items }) => (
          <div key={title} style={{ background: 'white', border: '1px solid #c8d0dc', borderTop: '3px solid #2c5f9e' }}>
            <div className="px-4 py-2.5 font-bold text-sm"
              style={{ borderBottom: '1px solid #e0e6ef', color: '#1a3a6b', background: '#f0f5ff' }}>
              {title}
            </div>
            <ul className="p-4 space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="text-gov-orange font-bold mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="lg:col-span-2"
          style={{ background: '#1a3a6b', border: '1px solid #0d2347', borderLeft: '4px solid #f7941d', borderRadius: '2px', padding: '16px' }}>
          <p className="text-white font-bold text-sm mb-2">📞 Technical Support</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-200">
            <div>NIC Helpdesk: <strong className="text-white">1800-111-0888</strong></div>
            <div>Email: <strong className="text-white">nmads-support@nic.in</strong></div>
            <div>Hours: <strong className="text-white">Mon–Sat, 9:00 AM – 6:00 PM IST</strong></div>
          </div>
        </div>
      </div>
    </GovLayout>
  );
}

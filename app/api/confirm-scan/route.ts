import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import mongoose from 'mongoose';

// Store confirmed scans in a collection — these will be used for FL training
const ConfirmedScanSchema = new mongoose.Schema({
  patientId:       { type: String, required: true },
  aiPrediction:    { type: String, required: true },   // what AI said
  confirmedLabel:  { type: String, required: true },   // what doctor said (true label)
  isCorrect:       { type: Boolean },
  confidence:      { type: String },
  hospitalId:      { type: String, default: 'AIIMS_NAGPUR' },
  usedInTraining:  { type: Boolean, default: false },  // has this been used in an FL round?
}, { timestamps: true });

const ConfirmedScan = mongoose.models.ConfirmedScan
  || mongoose.model('ConfirmedScan', ConfirmedScanSchema);

export async function POST(req: NextRequest) {
  await connectDB();
  const { patientId, aiPrediction, confirmedLabel, confidence } = await req.json();

  if (!patientId || !confirmedLabel)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const scan = await ConfirmedScan.create({
    patientId,
    aiPrediction,
    confirmedLabel,
    isCorrect: aiPrediction === confirmedLabel,
    confidence,
  });

  // Now tell mammo-server to queue this scan for local FL training
  try {
    const serverUrl = process.env.MAMMO_SERVER_URL || 'http://localhost:8000';
    await fetch(`${serverUrl}/queue-for-training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, confirmedLabel }),
      signal: AbortSignal.timeout(3000) // 3s timeout, don't block if server is down
    });
  } catch {
    // If mammo-server is offline, we still save the confirmation locally
    console.log('mammo-server offline — scan saved locally for later sync');
  }

  return NextResponse.json({ 
    success: true, 
    scanId: scan._id,
    message: 'Diagnosis confirmed and queued for Federated Learning training'
  });
}

// GET — fetch all unconfirmed or pending FL scans
export async function GET() {
  await connectDB();
  const pending = await ConfirmedScan.find({ usedInTraining: false }).sort({ createdAt: -1 }).limit(50);
  const total   = await ConfirmedScan.countDocuments();
  const trained = await ConfirmedScan.countDocuments({ usedInTraining: true });
  return NextResponse.json({ pending, total, trained });
}

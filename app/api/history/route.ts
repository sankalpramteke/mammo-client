// app/api/history/route.ts
// Returns all predictions for the authenticated doctor, sorted newest first
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Prediction from '@/models/Prediction';
import { verifyToken } from '@/lib/verifyToken';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req.headers.get('authorization'));
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
  }

  try {
    await connectDB();

    const predictions = await Prediction.find({ doctorId: payload.doctorId })
      .sort({ createdAt: -1 })
      .lean();

    const records = predictions.map((p) => ({
      id: p._id.toString(),
      patientId: p.patientCode,
      result: p.prediction,
      confidence: p.confidence,
      benignProb: p.benignProb,
      malignantProb: p.malignantProb,
      imageName: p.imageName,
      modelVersion: p.modelVersion,
      date: new Date(p.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
    }));

    return NextResponse.json(records);
  } catch (err) {
    console.error('[/api/history]', err);
    return NextResponse.json({ error: 'Failed to load history.' }, { status: 500 });
  }
}

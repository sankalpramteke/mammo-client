// app/api/predict/route.ts
// Verifies JWT → forwards image to FastAPI → saves Prediction to MongoDB → returns result
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Prediction from '@/models/Prediction';
import { verifyToken } from '@/lib/verifyToken';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  // Authenticate
  const payload = verifyToken(req.headers.get('authorization'));
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
  }

  try {
    // Forward the multipart/form-data body to FastAPI as-is
    const formData = await req.formData();

    const fastapiRes = await fetch(`${FASTAPI_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!fastapiRes.ok) {
      const errText = await fastapiRes.text();
      console.error('[/api/predict] FastAPI error:', errText);
      return NextResponse.json(
        { error: 'AI model server returned an error. Please try again.' },
        { status: 502 }
      );
    }

    const aiResult = await fastapiRes.json() as {
      prediction: string;
      confidence: string;
      benign_prob: string;
      malignant_prob: string;
    };

    // Extract optional patientCode and imageName from form
    const patientCode =
      (formData.get('patient_code') as string) ||
      `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const imageFile = formData.get('file') as File | null;
    const imageName = imageFile?.name || '';

    // Save to MongoDB
    await connectDB();
    const prediction = await Prediction.create({
      doctorId: payload.doctorId,
      patientCode,
      prediction: aiResult.prediction,
      confidence: aiResult.confidence,
      benignProb: aiResult.benign_prob,
      malignantProb: aiResult.malignant_prob,
      modelVersion: 'ResNet50-FL-v2',
      imageName,
    });

    return NextResponse.json({
      _id: prediction._id.toString(),
      prediction: aiResult.prediction,
      confidence: aiResult.confidence,
      benign_prob: aiResult.benign_prob,
      malignant_prob: aiResult.malignant_prob,
      patientCode,
      imageName,
    });
  } catch (err: unknown) {
    console.error('[/api/predict]', err);
    // Distinguish FastAPI offline from other errors
    const isNetworkError =
      err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('ECONNREFUSED'));
    if (isNetworkError) {
      return NextResponse.json(
        { error: 'Backend not connected. Please ensure the FastAPI server is running on port 8000.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Prediction failed. Please try again.' }, { status: 500 });
  }
}

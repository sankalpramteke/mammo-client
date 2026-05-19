// app/api/predict-heatmap/route.ts
// Forwards the image to FastAPI /predict-with-heatmap and returns prediction + base64 heatmap
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/verifyToken';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const payload = verifyToken(req.headers.get('authorization'));
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const fastapiRes = await fetch(`${FASTAPI_URL}/predict-with-heatmap`, {
      method: 'POST',
      body: formData,
    });

    if (!fastapiRes.ok) {
      const errText = await fastapiRes.text();
      console.error('[/api/predict-heatmap] FastAPI error:', errText);
      return NextResponse.json({ error: 'Heatmap generation failed.' }, { status: 502 });
    }

    const result = await fastapiRes.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('[/api/predict-heatmap]', err);
    const isNetworkError =
      err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('ECONNREFUSED'));
    if (isNetworkError) {
      return NextResponse.json(
        { error: 'Backend not connected. Ensure FastAPI is running on port 8000.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Heatmap request failed.' }, { status: 500 });
  }
}

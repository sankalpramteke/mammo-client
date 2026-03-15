// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import Doctor from '@/models/Doctor';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, hospitalName } = await req.json();

    if (!name || !email || !password || !hospitalName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    await connectDB();

    // Check duplicate email
    const existing = await Doctor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      hospitalName,
    });

    // ── Notify mammo-global about this hospital ──────────────────────────
    const globalUrl = process.env.GLOBAL_SERVER_URL || 'http://localhost:3001';
    const hospitalId = hospitalName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    try {
      await fetch(`${globalUrl}/api/hospitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          name: hospitalName,
          location: hospitalName, // use hospital name as location
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      console.log('mammo-global offline — hospital will sync on next heartbeat');
    }

    // Sign JWT
    const token = jwt.sign(
      { doctorId: doctor._id.toString(), email: doctor.email, name: doctor.name, hospitalName: doctor.hospitalName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      doctorId: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      hospitalName: doctor.hospitalName,
    });
  } catch (err) {
    console.error('[/api/auth/register]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}

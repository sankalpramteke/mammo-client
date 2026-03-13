// models/Doctor.ts — Doctor (authenticated user) schema
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  hospitalName: string;
  createdAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    hospitalName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Avoid recompiling on hot-reload
const Doctor: Model<IDoctor> =
  (mongoose.models.Doctor as Model<IDoctor>) ||
  mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;

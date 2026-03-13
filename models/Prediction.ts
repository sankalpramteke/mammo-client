// models/Prediction.ts — Prediction result schema
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPrediction extends Document {
  doctorId: Types.ObjectId;
  patientCode: string;
  prediction: string;         // "Benign" | "Malignant"
  confidence: string;         // e.g. "94.20%"
  benignProb: string;         // e.g. "94.20%"
  malignantProb: string;      // e.g. "5.80%"
  modelVersion: string;       // e.g. "ResNet50-FL-v2"
  imageName: string;
  createdAt: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patientCode: { type: String, required: true, trim: true },
    prediction: { type: String, required: true },
    confidence: { type: String, required: true },
    benignProb: { type: String, required: true },
    malignantProb: { type: String, required: true },
    modelVersion: { type: String, default: 'ResNet50-FL-v2' },
    imageName: { type: String, default: '' },
  },
  { timestamps: true }
);

const Prediction: Model<IPrediction> =
  (mongoose.models.Prediction as Model<IPrediction>) ||
  mongoose.model<IPrediction>('Prediction', PredictionSchema);

export default Prediction;

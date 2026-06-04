import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  country: { type: String, required: true },
  disease: { type: String, required: true },
  year: { type: Number, required: true },
  growthRate: { type: Number, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  createdAt: { type: Date, default: Date.now },
});

export const Alert = mongoose.model('Alert', AlertSchema);

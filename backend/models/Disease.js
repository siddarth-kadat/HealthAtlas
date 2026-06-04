import mongoose from 'mongoose';

const DiseaseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String },
});

export const Disease = mongoose.model('Disease', DiseaseSchema);

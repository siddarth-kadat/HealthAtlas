import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  region: { type: String },
  population: { type: Number },
});

export const Country = mongoose.model('Country', CountrySchema);

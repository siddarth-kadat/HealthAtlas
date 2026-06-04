import mongoose from 'mongoose';

const HealthStatSchema = new mongoose.Schema({
  country: { type: String, required: true, index: true },
  year: { type: Number, required: true, index: true },
  diseaseName: { type: String, required: true, index: true },
  diseaseCategory: { type: String },
  prevalenceRate: { type: Number },
  ageGroup: { type: String },
  gender: { type: String },
  populationAffected: { type: Number },
  improvementIn5Years: { type: Number },
  updatedAt: { type: Date, default: Date.now },
});

HealthStatSchema.index({ country: 1, diseaseName: 1, gender: 1, ageGroup: 1, year: 1 });
HealthStatSchema.index({ diseaseName: 1, year: 1 });
HealthStatSchema.index({ country: 1, year: 1 });
HealthStatSchema.index({ gender: 1, year: 1 });
HealthStatSchema.index({ ageGroup: 1, year: 1 });

export const HealthStat = mongoose.model('HealthStat', HealthStatSchema);

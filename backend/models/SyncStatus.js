import mongoose from 'mongoose';

const SyncStatusSchema = new mongoose.Schema({
  datasetName: { type: String, required: true },
  source: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  freshnessColor: { type: String, enum: ['Green', 'Amber', 'Red'], default: 'Green' },
});

export const SyncStatus = mongoose.model('SyncStatus', SyncStatusSchema);

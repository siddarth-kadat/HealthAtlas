import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'chart'], required: true },
  content: mongoose.Schema.Types.Mixed,
  order: { type: Number, default: 0 }
});

const StorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true, default: 'Untitled Story' },
  description: { type: String, default: '' },
  blocks: [BlockSchema],
  theme: { type: String, default: '#3b82f6' },
  slug: { type: String, required: true, index: true },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  viewCount: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Story = mongoose.model('Story', StorySchema);

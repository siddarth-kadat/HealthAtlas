import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the problematic collections index
    const db = mongoose.connection.db;
    const collection = db.collection('stories');
    
    // Get all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the duplicate key index
    try {
      await collection.dropIndex('publicSlug_1');
      console.log('Dropped publicSlug_1 index');
    } catch (e) {
      console.log('publicSlug_1 index not found (OK)');
    }

    // Drop old slug unique index if it exists
    try {
      await collection.dropIndex('slug_1');
      console.log('Dropped slug_1 index');
    } catch (e) {
      console.log('slug_1 index not found (OK)');
    }

    // Create new indexes based on schema
    await collection.createIndex({ slug: 1 });
    console.log('Created slug index');

    // List final indexes
    const finalIndexes = await collection.listIndexes().toArray();
    console.log('Final indexes:', finalIndexes.map(i => i.name));

    console.log('✅ Index cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanupIndexes();

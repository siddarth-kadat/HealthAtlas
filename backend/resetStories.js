import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetStoriesCollection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('stories');
    
    // Delete all stories
    const result = await collection.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} stories`);

    // Drop all indexes except _id
    try {
      const indexesInfo = await collection.listIndexes().toArray();
      for (const index of indexesInfo) {
        if (index.name !== '_id_') {
          try {
            await collection.dropIndex(index.name);
            console.log(`✓ Dropped index: ${index.name}`);
          } catch (e) {
            console.log(`⚠ Could not drop index ${index.name}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.log('Index cleanup skipped');
    }

    console.log('✅ Stories collection reset complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetStoriesCollection();

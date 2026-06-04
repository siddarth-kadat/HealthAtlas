import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const colInfo of collections) {
      const name = colInfo.name;
      const stats = await db.command({ collStats: name });
      console.log(`Collection: ${name}`);
      console.log(` - Documents: ${stats.count}`);
      console.log(` - Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(` - Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(` - Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDb();

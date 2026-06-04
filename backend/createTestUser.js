import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const createTestUser = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB...');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'user@gmail.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      process.exit(0);
    }

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testPassword = 'HealthAtlas$2026@Secure';
    const testHashedPassword = await bcrypt.hash(testPassword, salt);
    
    const testUser = new User({
      name: 'Test User',
      email: 'user@gmail.com',
      password: testHashedPassword,
      role: 'user'
    });

    await testUser.save();
    console.log('✓ Test user created successfully!');
    console.log('  Email: user@gmail.com');
    console.log('  Password: HealthAtlas$2026@Secure');
    console.log('  Role: user');

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'admin@healthatlas.gov' });
    if (!existingAdmin) {
      const adminPassword = 'AdminHA$2026#Secure';
      const adminHashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@healthatlas.gov',
        password: adminHashedPassword,
        role: 'admin'
      });

      await adminUser.save();
      console.log('\n✓ Admin user created successfully!');
      console.log('  Email: admin@healthatlas.gov');
      console.log('  Password: AdminHA$2026#Secure');
      console.log('  Role: admin');
    } else {
      console.log('\nAdmin user already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err.message);
    process.exit(1);
  }
};

createTestUser();

#!/usr/bin/env node
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

const testApi = {
  health: async () => {
    console.log('\n🔍 Testing Health Endpoint...');
    try {
      const res = await axios.get(`http://localhost:5000/api/health`);
      console.log('✓ Health Check:', res.data);
      return true;
    } catch (err) {
      console.log('✗ Health Check Failed:', err.message);
      return false;
    }
  },

  register: async (name, email, password) => {
    console.log(`\n📝 Testing Registration: ${email}...`);
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, {
        name,
        email,
        password
      });
      console.log('✓ Registration Successful');
      authToken = res.data.token;
      console.log('  Token stored:', authToken.substring(0, 20) + '...');
      return true;
    } catch (err) {
      console.log('✗ Registration Failed:', err.response?.data || err.message);
      return false;
    }
  },

  login: async (email, password) => {
    console.log(`\n🔓 Testing Login: ${email}...`);
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password
      });
      console.log('✓ Login Successful');
      authToken = res.data.token;
      console.log('  Token:', authToken.substring(0, 20) + '...');
      return true;
    } catch (err) {
      console.log('✗ Login Failed:', err.response?.data || err.message);
      return false;
    }
  },

  profile: async () => {
    console.log('\n👤 Testing Profile Endpoint...');
    try {
      const res = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: {
          'x-auth-token': authToken
        }
      });
      console.log('✓ Profile Retrieved:', {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      });
      return true;
    } catch (err) {
      console.log('✗ Profile Fetch Failed:', err.response?.data || err.message);
      return false;
    }
  },

  chat: async (message) => {
    console.log(`\n💬 Testing Chat Endpoint: "${message}"...`);
    try {
      const res = await axios.post(`${BASE_URL}/chat`, 
        { message },
        {
          headers: {
            'x-auth-token': authToken
          }
        }
      );
      console.log('✓ Chat Response:', res.data.text.substring(0, 100) + '...');
      return true;
    } catch (err) {
      console.log('✗ Chat Failed:', err.response?.data || err.message);
      return false;
    }
  }
};

// Run all tests
const runTests = async () => {
  console.log('====================================');
  console.log('🧪 HealthAtlas API Test Suite');
  console.log('====================================');

  // Test health
  const healthOk = await testApi.health();
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Please start the server first.');
    process.exit(1);
  }

  // Test login
  const loginOk = await testApi.login('user@gmail.com', 'HealthAtlas$2026@Secure');
  if (!loginOk) {
    console.log('\n⚠️  Login failed. Trying to register...');
    await testApi.register('Test User', 'testuser@example.com', 'TestPass$2026');
    await testApi.login('testuser@example.com', 'TestPass$2026');
  }

  // Test profile
  if (authToken) {
    await testApi.profile();

    // Test chat
    await testApi.chat('What are the global health trends?');
  }

  console.log('\n====================================');
  console.log('✓ Test Suite Complete');
  console.log('====================================\n');
};

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

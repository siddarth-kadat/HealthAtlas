# HealthAtlas Authentication & Chatbot Fix Guide

## Issues Identified & Fixed

### 1. ✓ API URL Configuration (FIXED)
**Problem**: Frontend was using relative `/api` path which doesn't work in development when backend is on a different port
**Solution**: Updated `frontend/src/services/api.js` to use `VITE_API_URL` environment variable
**File Modified**: `frontend/src/services/api.js`

### 2. ✓ Missing Imports in Server (FIXED)  
**Problem**: `server.js` was missing `path` module import needed for production build
**Solution**: Added required imports:
- `import path from 'path'`
- `import { fileURLToPath } from 'url'`
- Configured `__dirname` for ES modules
**File Modified**: `backend/server.js`

### 3. Test Users Setup (VERIFIED)
Test users with secure credentials:
- **User Account**: 
  - Email: `user@gmail.com`
  - Password: `HealthAtlas$2026@Secure`
  - Role: user
- **Admin Account**:
  - Email: `admin@healthatlas.gov`
  - Password: `AdminHA$2026#Secure`
  - Role: admin

## How to Fix the Issues

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Start the Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Step 3: Start the Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173 (or another port)
```

### Step 4: Test the Fixes
Run the API test script (in a new terminal):
```bash
cd backend
node testApi.js
```

This will verify:
- ✓ Backend connectivity
- ✓ User authentication
- ✓ Profile retrieval
- ✓ Chat endpoint

## Testing the Application

### Login Test
1. Go to the login page
2. Enter credentials:
   - Email: `user@gmail.com`
   - Password: `HealthAtlas$2026@Secure`
3. Click "Authenticate Session"
4. Should redirect to dashboard

### Chatbot Test
1. After successful login, look for the chatbot widget (bottom-right)
2. The Health Assistant should say "Hello! I am your HealthAtlas Assistant..."
3. Type a message like: "What are the health trends?"
4. Should receive a response from the AI (using Groq API)

## Environment Variables

### Backend (.env)
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=healthatlas_super_secure_jwt_2026_!@#abc
GROQ_API_KEY=<your-groq-api-key>
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### Issue: "Failed to authenticate" error
**Causes**:
- Wrong email/password combination
- MongoDB connection failed
- JWT_SECRET not set

**Solution**:
1. Verify credentials: `user@gmail.com` / `HealthAtlas$2026@Secure`
2. Check MongoDB connection: `curl http://localhost:5000/api/health`
3. Ensure JWT_SECRET is in `.env`
4. Run test script: `node testApi.js`

### Issue: "Request failed with status code 404" in chatbot
**Causes**:
- API URL not properly configured
- Authentication token not being sent
- Chat endpoint not registered

**Solution**:
1. Verify VITE_API_URL in frontend `.env`
2. Check browser console for network requests
3. Ensure user is logged in (token in localStorage)
4. Verify backend is running on port 5000

### Issue: Chatbot shows "Trouble connecting to AI system"
**Causes**:
- GROQ_API_KEY not set or invalid
- Network request to Groq API failed
- Authentication middleware blocking request

**Solution**:
1. Verify GROQ_API_KEY in backend `.env`
2. Check that user is authenticated
3. Run: `curl -H "x-auth-token: YOUR_TOKEN" http://localhost:5000/api/chat` to test directly

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check endpoint responds: `http://localhost:5000/api/health`
- [ ] Login with `user@gmail.com` / `password123` succeeds
- [ ] Profile endpoint returns user data
- [ ] Chat endpoint responds to messages
- [ ] Chatbot widget appears and responds in UI
- [ ] No 404 errors in browser console

## Next Steps if Issues Persist

1. **Check Backend Logs**: Look for MongoDB connection errors, API key issues
2. **Check Browser Console**: Look for network errors, CORS issues
3. **Run Test Script**: `node testApi.js` to isolate the problem
4. **Check Environment Variables**: Ensure all required vars are set
5. **Restart Services**: Kill and restart both backend and frontend

## Files Created/Modified

- ✓ `backend/server.js` - Added missing imports
- ✓ `frontend/src/services/api.js` - Fixed API URL configuration
- ✓ `backend/createTestUser.js` - Test user setup script
- ✓ `backend/testApi.js` - API endpoint test suite

## Resources

- MongoDB: https://www.mongodb.com/
- Groq API: https://console.groq.com/
- JWT Documentation: https://jwt.io/
- Express.js: https://expressjs.com/
- Vite: https://vitejs.dev/

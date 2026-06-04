import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MapView from './pages/MapView';
import Rankings from './pages/Rankings';
import Predictions from './pages/Predictions';
import Alerts from './pages/Alerts';
import StoryMode from './pages/StoryMode';
import PublicStory from './pages/PublicStory';
import UploadDataset from './pages/UploadDataset';
import Settings from './pages/Settings';
import Scorecard from './pages/Scorecard';
import HealthChatbot from './components/HealthChatbot';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen auth-shell flex items-center justify-center p-6">
      <div className="glass-card ha-float px-8 py-7 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
          <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
        </div>
        <p className="text-sm font-extrabold uppercase tracking-widest text-slate-500">Loading</p>
      </div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/map" element={<PrivateRoute><MapView /></PrivateRoute>} />
          <Route path="/rankings" element={<PrivateRoute><Rankings /></PrivateRoute>} />
          <Route path="/predictions" element={<PrivateRoute><Predictions /></PrivateRoute>} />
          <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
          <Route path="/stories" element={<PrivateRoute><StoryMode /></PrivateRoute>} />
          <Route path="/story/:slug" element={<PublicStory />} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><UploadDataset /></PrivateRoute>} />
          <Route path="/scorecard" element={<PrivateRoute><Scorecard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <HealthChatbot />
      </AuthProvider>
    </ThemeProvider>
  );
}

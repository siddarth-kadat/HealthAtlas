import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            await login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell min-h-screen flex items-center justify-center p-6 font-sans">
            <div className="glass-card w-full max-w-md p-10 rounded-[28px] border border-slate-200">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5-lg-blue-500/20">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-[-0.04em]">HealthAtlas</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Global Surveillance & Analysis Portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-tight">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                            placeholder="name@organization.gov"
                            required
                        />
                    </div>
                    <div className="space-y-2">
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-3 pr-12 bg-white rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono placeholder:text-slate-300"
      placeholder="••••••••"
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showPassword ? (
        <EyeOff className="w-5 h-5" />
      ) : (
        <Eye className="w-5 h-5" />
      )}
    </button>
  </div>
</div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm-xl-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <span>Login</span>
                                <ArrowRight className="w-4 h-4 opacity-50" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-xs text-slate-500 font-medium">
                    Don't have account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};


export default Login;

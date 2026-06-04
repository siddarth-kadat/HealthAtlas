import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateField = (name, value) => {
        if (name === 'name') {
            const normalizedName = value.trim();
            if (!/^[A-Za-z\s]+$/.test(normalizedName) || normalizedName.length < 3) {
                return 'Please enter a valid name (letters and spaces only).';
            }
        }

        if (name === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return 'Please enter a valid email address.';
            }
        }

        if (name === 'password') {
            if (value.length < 8) {
                return 'Password must be at least 8 characters long.';
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(value)) {
                return 'Password must contain uppercase, lowercase, number, and special character.';
            }
        }

        return '';
    };

    const validateForm = (data) => {
        const errors = {};
        Object.keys(data).forEach((fieldName) => {
            const message = validateField(fieldName, data[fieldName]);
            if (message) errors[fieldName] = message;
        });
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextFormData = { ...formData, [name]: value };
        setFormData(nextFormData);

        if (touchedFields[name] || fieldErrors[name]) {
            const message = validateField(name, value);
            setFieldErrors((prev) => {
                const nextErrors = { ...prev };
                if (message) {
                    nextErrors[name] = message;
                } else {
                    delete nextErrors[name];
                }
                return nextErrors;
            });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const message = validateField(name, value);
        setTouchedFields((prev) => ({ ...prev, [name]: true }));
        setFieldErrors((prev) => {
            const nextErrors = { ...prev };
            if (message) {
                nextErrors[name] = message;
            } else {
                delete nextErrors[name];
            }
            return nextErrors;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        setTouchedFields({ name: true, email: true, password: true });
        setFieldErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            await login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.errors) {
                // Handle express-validator errors
                setError(err.response.data.errors.map((e) => e.msg).join(', '));
            } else {
                const errorMsg = err.response?.data?.msg || err.response?.data || 'An unexpected error occurred during registration. Please check your network and try again.';
                setError(typeof errorMsg === 'string' ? errorMsg : 'Registration failed');
            }
            console.error('Registration Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell min-h-screen flex items-center justify-center p-6 font-sans">
            <div className="glass-card w-full max-w-md p-10 rounded-[28px] border border-slate-200">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5-lg-blue-500/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-[-0.04em]">Registration</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Join the Global Surveillance Network</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-tight">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-invalid={Boolean(fieldErrors.name)}
                            className={`w-full px-4 py-3 bg-white rounded-[14px] text-sm outline-none focus:ring-2 transition-all placeholder:text-slate-300 ${fieldErrors.name ? 'ring-2 ring-red-500/20 focus:ring-red-500/30' : 'focus:ring-blue-500/20'
                                }`}
                            placeholder="Dr. Jordan Smith"
                        />
                        {fieldErrors.name && <p className="text-xs font-semibold text-red-600">{fieldErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-invalid={Boolean(fieldErrors.email)}
                            className={`w-full px-4 py-3 bg-white rounded-[14px] text-sm outline-none focus:ring-2 transition-all placeholder:text-slate-300 ${fieldErrors.email ? 'ring-2 ring-red-500/20 focus:ring-red-500/30' : 'focus:ring-blue-500/20'
                                }`}
                            placeholder="jsmith@health.org"
                        />
                        {fieldErrors.email && <p className="text-xs font-semibold text-red-600">{fieldErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={Boolean(fieldErrors.password)}
                                className={`w-full px-4 py-3 pr-12 bg-white rounded-[14px] text-sm outline-none focus:ring-2 transition-all font-mono placeholder:text-slate-300 ${fieldErrors.password
                                        ? 'ring-2 ring-red-500/20 focus:ring-red-500/30'
                                        : 'focus:ring-blue-500/20'
                                    }`}
                                placeholder="••••••••"
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

                        {fieldErrors.password && (
                            <p className="text-xs font-semibold text-red-600">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm-xl-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <span>Register</span>
                                <ArrowRight className="w-4 h-4 opacity-50" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-xs text-slate-500 font-medium">
                    Already registered? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in to session</Link>
                </p>
            </div>
        </div>
    );
};


export default Register;

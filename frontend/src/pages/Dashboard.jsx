import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
    Users,
    Globe,
    Activity,
    ShieldAlert,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const MAX_DATASET_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;
const GENDER_OPTIONS = [
    { value: 'All', label: 'All Genders' },
    { value: 'Female', label: 'Female' },
    { value: 'Male', label: 'Male' }
];
const GENDER_COLORS = {
    Female: '#2563eb',
    Male: '#10b981'
};

const StatCard = ({ title, value, badge, colorClass = 'text-blue-600', tone = 'ha-soft-blue' }) => (
    <div className={`glass-card ${tone} p-6 rounded-[20px] transition-all hover:-translate-y-1`}>
        <p className="text-[13px] text-slate-500 font-extrabold uppercase tracking-tight mb-3">{title}</p>
        <div className="space-y-1">
            <h2 className={`text-4xl font-extrabold tracking-[-0.05em] ${colorClass}`}>{value}</h2>
            {badge && <span className={`text-sm font-semibold ${colorClass}`}>{badge}</span>}
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [selectedDisease, setSelectedDisease] = useState('All');
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedYear, setSelectedYear] = useState('All');
    const [selectedGender, setSelectedGender] = useState('All');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');
    const [syncStatus, setSyncStatus] = useState([]);
    const [datasetFile, setDatasetFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadInputKey, setUploadInputKey] = useState(0);
    const dashboardRequestId = useRef(0);

    const fetchSummaryAndSync = useCallback(async () => {
        try {
            const [sumRes, syncRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/dashboard/sync-status')
            ]);
            setSummary(sumRes.data);
            setSyncStatus(syncRes.data);
        } catch (err) {
            console.error('Error fetching summary/sync data:', err);
        }
    }, []);

    const fetchDashboardData = useCallback(async () => {
        const requestId = dashboardRequestId.current + 1;
        dashboardRequestId.current = requestId;
        setLoading(true);
        try {
            const params = {
                country: selectedCountry,
                disease: selectedDisease,
                year: selectedYear,
                gender: selectedGender,
                ageGroup: selectedAgeGroup
            };
            const [trendRes, genderRes] = await Promise.all([
                api.get('/dashboard/trends', { params }),
                api.get('/dashboard/gender', { params })
            ]);
            if (dashboardRequestId.current !== requestId) return;
            setTrends(trendRes.data);
            setGenderData(genderRes.data);
        } catch (err) {
            if (dashboardRequestId.current !== requestId) return;
            console.error('Error fetching dashboard data:', err);
        } finally {
            if (dashboardRequestId.current !== requestId) return;
            setLoading(false);
        }
    }, [selectedCountry, selectedDisease, selectedYear, selectedGender, selectedAgeGroup]);

    useEffect(() => {
        fetchSummaryAndSync();
    }, [fetchSummaryAndSync]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleDatasetFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        setUploadStatus('idle');
        setUploadMessage('');

        if (!selectedFile) {
            setDatasetFile(null);
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            setDatasetFile(null);
            setUploadStatus('error');
            setUploadMessage('Please upload a CSV file matching the required healthstats format.');
            return;
        }

        if (selectedFile.size > MAX_DATASET_UPLOAD_SIZE_BYTES) {
            setDatasetFile(null);
            setUploadStatus('error');
            setUploadMessage('File is too large. Maximum dataset upload size is 50MB.');
            return;
        }

        setDatasetFile(selectedFile);
    };

    const handleDatasetUpload = async () => {
        if (!datasetFile) return;

        setUploadLoading(true);
        setUploadStatus('idle');
        setUploadMessage('');

        const formData = new FormData();
        formData.append('dataset', datasetFile);

        try {
            const res = await api.post('/upload/csv/append', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploadStatus('success');
            setUploadMessage(`${res.data.msg}. Added ${res.data.count} rows.`);
            setDatasetFile(null);
            setUploadInputKey((key) => key + 1);
            await Promise.all([fetchSummaryAndSync(), fetchDashboardData()]);
        } catch (err) {
            setUploadStatus('error');
            setUploadMessage(err.response?.data?.msg || 'Dataset upload failed');
        } finally {
            setUploadLoading(false);
        }
    };

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const formatCompactNumber = (value) => {
        if (!Number.isFinite(value)) return '0';
        return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Sync Indicator Row */}
                <div className="flex flex-wrap gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {syncStatus.length > 0 ? syncStatus.map((s) => (
                        <div key={s._id} className="flex items-center gap-2 glass-card/50 px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap">
                            <span className={`w-2 h-2 rounded-full ${s.freshnessColor === 'Green' ? 'bg-green-500' :
                                    s.freshnessColor === 'Amber' ? 'bg-amber-500' : 'bg-red-500'
                                } animate-pulse`}></span>
                            <span className="font-bold text-slate-700 uppercase tracking-tight">{s.datasetName}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500">{new Date(s.lastUpdated).toLocaleDateString()}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-blue-600 font-medium">{s.source}</span>
                        </div>
                    )) : (
                        <div className="flex items-center gap-2 glass-card/50 px-3 py-1.5 rounded-lg text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="font-bold text-slate-700 uppercase tracking-tight">System Status: Optimal</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500">Real-time sync active</span>
                        </div>
                    )}
                </div>
                
                {/* Dataset Upload */}
                {/*}
                <div className="glass-card p-5 rounded-[24px] flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Append HealthStats Dataset</h3>
                                    <p className="text-sm text-slate-500">Upload a CSV with the same column format. Max file size: 50MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                key={uploadInputKey}
                                id="dashboard-dataset-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleDatasetFileChange}
                            />
                            <label
                                htmlFor="dashboard-dataset-upload"
                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                {datasetFile ? datasetFile.name : 'Choose CSV'}
                            </label>
                            <button
                                onClick={handleDatasetUpload}
                                disabled={!datasetFile || uploadLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                <span>{uploadLoading ? 'Appending...' : 'Upload & Append'}</span>
                            </button>
                        </div>
                    </div>

                    {uploadStatus !== 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium ${uploadStatus === 'success'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                                }`}
                        >
                            {uploadStatus === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            <span>{uploadMessage}</span>
                        </motion.div>
                    )}
                </div>
                {*/}

                {/* Filter Bar */}
                <div className="glass-card p-5 rounded-[24px] flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Country</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="bg-white rounded-[14px] px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[160px]"
                        >
                            <option value="All">All Countries</option>
                            {summary?.availableCountries?.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disease</label>
                        <select
                            value={selectedDisease}
                            onChange={(e) => setSelectedDisease(e.target.value)}
                            className="bg-white rounded-[14px] px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[170px]"
                        >
                            <option value="All">All Diseases</option>
                            {summary?.availableDiseases?.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-white rounded-[14px] px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[120px]"
                        >
                            <option value="All">All Years</option>
                            {summary?.availableYears?.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div> */}

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                        <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="bg-white rounded-[14px] px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[135px]"
                        >
                            {GENDER_OPTIONS.map((g) => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age Group</label>
                        <select
                            value={selectedAgeGroup}
                            onChange={(e) => setSelectedAgeGroup(e.target.value)}
                            className="bg-white rounded-[14px] px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none min-w-[135px]"
                        >
                            <option value="All">All Ages</option>
                            {summary?.availableAgeGroups?.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ml-auto">
                        <button
                            onClick={() => navigate('/scorecard')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all-md-blue-500/20"
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>Scorecard Leaderboard</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Countries Tracked"
                        value={summary?.countriesTracked || '0'}
                        badge="GLOBAL COVERAGE"
                        colorClass="text-[#0284C7]"
                        tone="ha-soft-blue"
                    />
                    <StatCard
                        title="Diseases Monitored"
                        value={summary?.diseasesTracked || '0'}
                        badge="DATASET TOTAL"
                        colorClass="text-[#16A34A]"
                        tone="ha-soft-green"
                    />
                    <StatCard
                        title="Avg Prevalence Rate"
                        value={`${summary?.avgRiskScore || '0'}%`}
                        badge="MEAN VALUE"
                        colorClass="text-[#D97706]"
                        tone="ha-soft-orange"
                    />
                    <StatCard
                        title="Data Alerts"
                        value={summary?.alertsActive || '0'}
                        badge="ACTIVE NOW"
                        colorClass="text-[#DC2626]"
                        tone="ha-soft-red"
                    />
                </section>

                {/* Main Charts Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    <div className="lg:col-span-2 glass-card rounded-[24px] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Disease Prevalence Trends</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> % PREVALENCE
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-6">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trends}>
                                        <defs>
                                            <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="year" axisLine={false} tickLine={false} className="text-[10px] font-mono text-slate-400" />
                                        <YAxis axisLine={false} tickLine={false} className="text-[10px] font-mono text-slate-400" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="prevalence" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorPrev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* AI Insight Card */}
                        <div className="rounded-[24px] p-6 text-white-lg relative overflow-hidden group shadow-xl shadow-blue-500/20" style={{ background: 'linear-gradient(135deg, #2196F3, #4F46E5)' }}>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 glass-card/10 rounded flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Dataset Analyzer</span>
                                </div>
                                <p className="text-base font-medium leading-relaxed mb-5 text-white/90">
                                    Atlas is ready to analyze your {summary?.countriesTracked || 0} countries and {summary?.diseasesTracked || 0} diseases.
                                </p>
                                <button
                                    onClick={() => navigate(`/predictions?country=${selectedCountry}&disease=${selectedDisease}`)}
                                    className="w-full py-3 bg-white/10 border border-white/25 text-white rounded-2xl text-sm font-bold transition-transform active:scale-95 hover:bg-white/20"
                                >
                                    EXPLORE AI PREDICTIONS
                                </button>
                            </div>
                            <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
                        </div>

                        {/* Minor Demographic Card */}
                        <div className="glass-card rounded-[24px] p-6 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Gender Distribution</h3>
                            <p className="text-[11px] text-slate-500 mb-4">
                                {genderData?.[0]?.year ? `Latest year snapshot: ${genderData[0].year}` : 'Latest available year snapshot'}
                            </p>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Array.isArray(genderData) && genderData.length > 0 ? genderData : [{ name: 'No Data', value: 1 }]}
                                                cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                                            >
                                                {Array.isArray(genderData) && genderData.map((item, index) => (
                                                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[item.name] || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-center gap-4">
                                {Array.isArray(genderData) && genderData.map((item, i) => (
                                    <div key={item.name} className="text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.name}</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[item.name] || COLORS[i % COLORS.length] }}></span>
                                            <span className="text-xs font-bold">{item.value?.toLocaleString() || 0}%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">Affected: {formatCompactNumber(item.totalAffected || 0)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, ShieldCheck, Activity, Bell, Filter, Loader2, Newspaper, ExternalLink, Globe, Zap, RefreshCcw } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('news');
    const [lastRefresh, setLastRefresh] = useState(null);
    const [newsWarning, setNewsWarning] = useState('');

    const fetchData = async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            else setLoading(true);

            const [alertsRes, newsRes] = await Promise.all([
                api.get('/alerts'),
                api.get('/alerts/news', { params: { force: isManual ? 'true' : 'false' } })
            ]);
            setAlerts(alertsRes.data);
            setNews(newsRes.data.items || []);
            setNewsWarning(newsRes.data.warning || '');
            setLastRefresh(newsRes.data.lastUpdated ? new Date(newsRes.data.lastUpdated) : new Date());
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Auto-refresh every hour (3600000 ms)
        const autoRefreshInterval = setInterval(() => {
            console.log('Auto-refreshing health news and alerts...');
            fetchData();
        }, 3600000); // 1 hour

        return () => clearInterval(autoRefreshInterval);
    }, []);

    const handleRefresh = () => {
        fetchData(true);
    };

    const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
    const criticalNewsCount = news.filter(n => n.severity === 'Critical').length;
    const highCount = alerts.filter(a => a.severity === 'High').length;

    return (
        <AppLayout>
            <div className="space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em]">Intelligence Hub</h1>
                        <p className="text-slate-500">Real-time health alerts and news monitoring system.</p>
                        {lastRefresh && (
                            <p className="text-xs text-slate-400 mt-2">
                                Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes hourly
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading || refreshing}
                                className="p-3 glass-card text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-2"
                                style={{ background: 'linear-gradient(to bottom, white, #f1f5f9)' }}
                                title="Manually refresh intelligence feed"
                            >
                                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
                                <span className="text-xs font-bold hidden sm:inline">Refresh</span>
                            </button>
                            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                                {/* <button
                                    onClick={() => setActiveTab('surveillance')}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'surveillance' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Surveillance
                                </button> */}
                                <button
                                    onClick={() => setActiveTab('news')}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Real-time News
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {newsWarning && activeTab === 'news' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {newsWarning}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 glass-card ha-soft-red rounded-[24px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical Anomalies</p>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{activeTab === 'surveillance' ? criticalCount : criticalNewsCount} Records</div>
                        <p className="text-red-600 text-[10px] font-bold">Priority Response</p>
                    </div>
                    <div className="p-6 glass-card ha-soft-orange rounded-[24px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                <Zap className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</p>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{activeTab === 'surveillance' ? alerts.length : news.length} Sources</div>
                        <p className="text-amber-600 text-[10px] font-bold">Last 48 Hours</p>
                    </div>
                    <div className="p-6 glass-card ha-soft-green rounded-[24px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                <Globe className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</p>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">Live</div>
                        <p className="text-green-600 text-[10px] font-bold">Continual Feed ACTIVE</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4"
                        >
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="font-bold uppercase text-xs tracking-widest">Refreshing Data Streams...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {activeTab === 'surveillance' ? (
                                alerts.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                                        No statistical anomalies detected
                                    </div>
                                ) : (
                                    alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="glass-card p-6 rounded-[24px] flex items-center justify-between group hover:border-slate-300 transition-all"
                                        >
                                            <div className="flex items-center space-x-5">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert.severity === 'Critical' ? 'bg-red-50 text-red-600' :
                                                        alert.severity === 'High' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="font-bold text-slate-900 text-sm">{alert.country} // {alert.disease}</h3>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${alert.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                                                            }`}>{alert.severity}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium italic">
                                                        {alert.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(alert.date).toLocaleDateString()}</p>
                                                <button className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Deep Analysis</button>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                news.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                                        Searching for latest health headlines...
                                    </div>
                                ) : (
                                    news.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="glass-card p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start md:space-x-4 space-y-4 md:space-y-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.severity === 'Critical' ? 'bg-red-50 text-red-600' :
                                                        item.severity === 'High' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    <Newspaper className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                            <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-600">{item.source}</span>
                                                            <span className={`px-2.5 py-1 rounded font-bold ${item.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                                                    item.severity === 'High' ? 'bg-amber-100 text-amber-700' :
                                                                        item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-green-100 text-green-700'
                                                                }`}>
                                                                {item.severity}
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded bg-slate-50 text-slate-600 border border-slate-100`}>
                                                                {item.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                        {item.title}
                                                    </h3>

                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                        {item.summary}
                                                    </p>

                                                    {item.url && item.url !== '#' && (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors pt-2 group/link"
                                                        >
                                                            <span>Read Full Advisory</span>
                                                            <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default Alerts;

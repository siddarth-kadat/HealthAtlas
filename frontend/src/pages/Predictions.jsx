import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Calendar, MapPin, Activity, HelpCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Predictions = () => {
 const [searchParams] = useSearchParams();
 const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'All');
 const [selectedDisease, setSelectedDisease] = useState(searchParams.get('disease') || 'Diabetes');
 const [availableCountries, setAvailableCountries] = useState([]);
 const [availableDiseases, setAvailableDiseases] = useState([]);
 const [predictionData, setPredictionData] = useState([]);
 const [selectedPoint, setSelectedPoint] = useState(null);
 const [meta, setMeta] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchMetadata = async () => {
 try {
 const res = await api.get('/dashboard/summary');
 setAvailableCountries(res.data.availableCountries);
 setAvailableDiseases(res.data.availableDiseases);
 
 const urlDisease = searchParams.get('disease');
 if (!urlDisease && res.data.availableDiseases.length > 0) {
 setSelectedDisease(res.data.availableDiseases[0]);
 }
 } catch (err) {
 console.error('Error fetching metadata:', err);
 }
 };
 fetchMetadata();
 }, []);

 useEffect(() => {
 const fetchData = async () => {
 try {
 setLoading(true);
 setSelectedPoint(null);
 const res = await api.get('/dashboard/predictions', {
 params: { country: selectedCountry, disease: selectedDisease }
 });
 setPredictionData(res.data.predictions);
 setMeta(res.data.latestMeta);
 } catch (err) {
 console.error('Error fetching predictions:', err);
 } finally {
 setLoading(false);
 }
 };
 if (selectedDisease) fetchData();
 }, [selectedCountry, selectedDisease]);

 const handleChartClick = (data) => {
 if (data && data.activePayload && data.activePayload.length > 0) {
 setSelectedPoint(data.activePayload[0].payload);
 }
 };

 return (
 <AppLayout>
 <div className="space-y-6">
 <header>
 <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
 <TrendingUp className="w-4 h-4" />
 <span>Intelligence Forecasting Engine v2.0</span>
 </div>
 <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em]">Health Projections</h1>
 <p className="text-slate-500">Predictive analytics for {selectedDisease} {selectedCountry !== 'All' ? `in ${selectedCountry}` : '(Global)'}.</p>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Main Chart */}
 <div className="lg:col-span-3 space-y-6">
 <div className="glass-card p-6 rounded-[24px]">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h3 className="text-lg font-bold text-slate-900">{meta?.diseaseName || selectedDisease} Forecast {selectedCountry !== 'All' ? `(${selectedCountry})` : ''}</h3>
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 items-center flex gap-1">
 <HelpCircle className="w-3 h-3" /> Click nodes for insights
 </p>
 </div>
 <div className="flex gap-4">
 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
 <span className="w-3 h-0.5 bg-blue-600"></span> ACTUAL
 </div>
 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
 <span className="w-3 h-0.5 border-t border-dashed border-blue-400"></span> ML FORECAST
 </div>
 </div>
 </div>

 <div className="h-[350px] cursor-crosshair">
 {loading ? (
 <div className="h-full flex items-center justify-center font-bold text-slate-400">
 <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
 <span>Computing Linear Regression...</span>
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={predictionData} onClick={handleChartClick}>
 <defs>
 <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
 <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="year" axisLine={false} tickLine={false} className="text-[10px] font-mono text-slate-400" dy={10} />
 <YAxis axisLine={false} tickLine={false} className="text-[10px] font-mono text-slate-400" tickFormatter={(val) => `${val}%`} />
 <Tooltip 
 contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
 itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
 />
 <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" fill="url(#colorForecast)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
 <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="transparent" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </div>

 <div className="mt-8 border-t border-slate-50 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="ha-soft-blue p-5 rounded-2xl border border-blue-100">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">5-Year Projected Result</p>
 <p className="text-2xl font-bold text-slate-900">{predictionData[predictionData.length - 1]?.forecast}%</p>
 <p className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${meta?.improvementIn5Years > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
 {meta?.improvementIn5Years > 0 ? 'Positive Progress' : 'Infection Growth Alert'}
 </p>
 </div>
 <div className="ha-soft-green p-5 rounded-2xl border border-green-100">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Analytic State</p>
 <p className="text-2xl font-bold text-blue-600">{meta?.improvementIn5Years > 0 ? 'Optimizing' : 'Urgent Response'}</p>
 <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Confidence: {meta?.confidenceScore || 'N/A'}</p>
 </div>
 <div className="p-5 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #111827, #1e293b)' }}>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Methodology</p>
 <p className="text-sm font-medium">Linear Multivariate Regression</p>
 <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">Using least-squares optimization on all historical data points found.</p>
 </div>
 </div>
 </div>

 {/* Detail Panel on Selection */}
 <motion.div 
 initial={false}
 animate={{ height: selectedPoint ? 'auto' : 0, opacity: selectedPoint ? 1 : 0 }}
 className="overflow-hidden"
 >
 {selectedPoint && (
 <div className="glass-card border-2 border-blue-100 p-6 rounded-[24px] relative">
 <button 
 onClick={() => setSelectedPoint(null)}
 className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
 >
 <Activity className="w-5 h-5 rotate-45" />
 </button>
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-4">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
 <Calendar className="w-3 h-3" />
 TARGET YEAR: {selectedPoint.year}
 </div>
 <h4 className="text-2xl font-bold text-slate-900">
 {selectedPoint.isForecast ? 'Forecasted Projection' : 'Verified Historical Record'}
 </h4>
 <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
 {selectedPoint.isForecast 
 ? `Based on health trends analyzed from previous years, the model estimates a prevalence rate of ${selectedPoint.forecast}% for ${selectedDisease}. This calculation assumes current environmental and socio-economic variables remain consistent with the established trajectory.`
 : `Official data recorded for the year ${selectedPoint.year}. This point serves as a baseline for the forecasting model's trajectory calculations.`
 }
 </p>
 </div>
 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center min-w-[180px] self-start md:self-center font-mono">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Statistical Value</p>
 <p className="text-5xl font-black text-blue-600">{selectedPoint.forecast}<span className="text-xl">%</span></p>
 <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Prevalence Ratio</p>
 </div>
 </div>
 </div>
 )}
 </motion.div>
 </div>

 {/* Right Sidebar */}
 <div className="space-y-6">
 <div className="glass-card p-6 rounded-[24px]">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Forecasting Controls</h3>
 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Region Target</label>
 <select 
 value={selectedCountry}
 onChange={(e) => setSelectedCountry(e.target.value)}
 className="w-full bg-white rounded-[14px] px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
 >
 <option value="All">Global (Aggregated)</option>
 {availableCountries.map(c => (
 <option key={c} value={c}>{c}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Disease Entity</label>
 <select 
 value={selectedDisease}
 onChange={(e) => setSelectedDisease(e.target.value)}
 className="w-full bg-white rounded-[14px] px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
 >
 {availableDiseases.map(d => (
 <option key={d} value={d}>{d}</option>
 ))}
 </select>
 </div>
 <div className="p-5 rounded-2xl text-white-lg-blue-500/20" style={{ background: 'linear-gradient(135deg, #2196F3, #4F46E5)' }}>
 <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Insight</p>
 <p className="text-xs font-medium leading-relaxed">
 {meta?.improvementIn5Years > 0 
 ? `Interventions are working. Projected ${Math.abs(meta?.improvementIn5Years).toFixed(1)}% reduction by 2029.` 
 : `Risk acceleration detected. Expecting ${Math.abs(meta?.improvementIn5Years).toFixed(1)}% caseload increase.`}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </AppLayout>
 );
};

export default Predictions;

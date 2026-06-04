import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowUpDown, Download, Filter } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Rankings = () => {
 const [data, setData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState('top');
 const [search, setSearch] = useState('');

 useEffect(() => {
 const fetchData = async () => {
 try {
 setLoading(true);
 const res = await api.get('/dashboard/rankings');
 setData(res.data);
 } catch (err) {
 console.error('Error fetching rankings:', err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 const filteredData = data.filter(item => 
 item.country.toLowerCase().includes(search.toLowerCase())
 );

 const displayData = tab === 'top' 
 ? filteredData.slice(0, 10) 
 : [...filteredData].reverse().slice(0, 10).map((item, idx) => ({ ...item, rank: filteredData.length - idx }));

 return (
 <AppLayout>
 <div className="space-y-8">
 <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em]">National Risk Rankings</h1>
 <p className="text-slate-500">Comparative analysis of health risk indicators by territory.</p>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={() => setTab('top')}
 className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${tab === 'top' ? 'bg-red-600 text-white-lg-red-900/20 shadow-lg shadow-red-500/15' : 'bg-white text-slate-600 border border-slate-200'}`}
 >
 TOP 10 RISK
 </button>
 <button 
 onClick={() => setTab('bottom')}
 className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${tab === 'bottom' ? 'bg-green-600 text-white-lg-green-900/20 shadow-lg shadow-green-500/15' : 'bg-white text-slate-600 border border-slate-200'}`}
 >
 LOWEST RISK
 </button>
 </div>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="md:col-span-2 relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Filter by country name..." 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-12 pr-4 py-3 glass-card rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
 />
 </div>
 </div>

 <div className="glass-card rounded-[24px] overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100">
 <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
 <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nation State</th>
 <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Prevalence %</th>
 <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Trend Index</th>
 <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Risk Score</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50">
 {loading ? (
 <tr>
 <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Calculating National Rankings...</td>
 </tr>
 ) : displayData.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No matching countries found</td>
 </tr>
 ) : displayData.map((item) => (
 <tr key={item.country} className="hover:bg-slate-50/50 transition-colors">
 <td className="px-8 py-5 font-mono text-slate-800 font-bold text-sm">#{item.rank}</td>
 <td className="px-8 py-5">
 <div className="flex items-center space-x-3">
 <div className="w-6 h-4 bg-slate-100 rounded overflow-hidden shrink-0"></div>
 <span className="font-bold text-slate-800 text-sm">{item.country}</span>
 </div>
 </td>
 <td className="px-8 py-5 text-sm font-medium text-slate-600">{item.prevalence}%</td>
 <td className="px-8 py-5 text-center">
 <span className={`text-xs font-bold ${item.trend.startsWith('+') ? 'text-red-500' : 'text-green-600'}`}>
 {item.trend}
 </span>
 </td>
 <td className="px-8 py-5 text-right">
 <span className={`text-sm font-mono font-bold ${
 item.risk === 'High' ? 'text-red-600' : 
 item.risk === 'Medium' ? 'text-amber-600' : 
 'text-green-600'
 }`}>
 {item.score.toFixed(1)}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </AppLayout>
 );
};

export default Rankings;

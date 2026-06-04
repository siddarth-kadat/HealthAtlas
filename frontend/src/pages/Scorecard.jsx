import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
 Trophy, 
 TrendingUp, 
 Users, 
 ArrowLeft, 
 Search, 
 Filter,
 ChevronUp,
 ChevronDown,
 Info,
 Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Scorecard = () => {
 const navigate = useNavigate();
 const [scorecard, setScorecard] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchScorecard = async () => {
 try {
 const res = await api.get('/dashboard/scorecard');
 setScorecard(res.data);
 setLoading(false);
 } catch (err) {
 console.error('Error fetching scorecard:', err);
 setLoading(false);
 }
 };
 fetchScorecard();
 }, []);

 const filteredData = scorecard.filter(item => 
 item.country.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const getGradeColor = (grade) => {
 switch (grade) {
 case 'A': return 'bg-green-100 text-green-700 border-green-200';
 case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
 case 'C': return 'bg-amber-100 text-amber-700 border-amber-200';
 case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
 case 'F': return 'bg-red-100 text-red-700 border-red-200';
 default: return 'bg-slate-100 text-slate-700 border-slate-200';
 }
 };

 if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

 return (
 <AppLayout>
 <div className="max-w-6xl mx-auto w-full space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <button 
 onClick={() => navigate('/dashboard')}
 className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2 text-sm font-medium"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to Dashboard
 </button>
 <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em] flex items-center gap-3">
 <Trophy className="w-8 h-8 text-amber-500" />
 Global Health Scorecard
 </h1>
 <p className="text-slate-500 mt-2">Annual comprehensive performance grading system.</p>
 </div>

 <div className="flex items-center gap-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text"
 placeholder="Search countries..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10 pr-4 py-3 glass-card rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-full md:w-72"
 />
 </div>
 </div>
 </div>

 {/* Scorecard Table */}
 <div className="glass-card rounded-[24px] overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100">
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Country</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
 <div className="flex items-center gap-1.5">
 Prevalence Rank
 <div className="group relative">
 <Info className="w-3 h-3 text-slate-300 cursor-help" />
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal">
 Graded based on average disease prevalence rate across all monitored conditions.
 </div>
 </div>
 </div>
 </th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
 <div className="flex items-center gap-1.5">
 Improvement Rate
 <div className="group relative">
 <Info className="w-3 h-3 text-slate-300 cursor-help" />
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal">
 Average progress in reducing disease presence over the last 5 years.
 </div>
 </div>
 </div>
 </th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
 <div className="flex items-center gap-1.5">
 Demographic Equity
 <div className="group relative">
 <Info className="w-3 h-3 text-slate-300 cursor-help" />
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal">
 Measures the consistency of health outcomes across different gender and age demographics.
 </div>
 </div>
 </div>
 </th>
 </tr>
 </thead>
 <tbody>
 {filteredData.map((item, index) => (
 <motion.tr 
 key={item.country}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
 >
 <td className="px-6 py-4">
 <span className={`text-sm font-bold ${index < 3 ? 'text-blue-600' : 'text-slate-400'}`}>
 #{index + 1}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
 {item.country.substring(0, 2).toUpperCase()}
 </div>
 <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
 {item.country}
 </span>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-bold ${getGradeColor(item.prevalenceGrade)}`}>
 {item.prevalenceGrade}
 </div>
 </td>
 <td className="px-6 py-4">
 <div className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-bold ${getGradeColor(item.improvementGrade)}`}>
 {item.improvementGrade}
 </div>
 </td>
 <td className="px-6 py-4">
 <div className={`inline-flex px-2.5 py-1 rounded-md border text-xs font-bold ${getGradeColor(item.equityGrade)}`}>
 {item.equityGrade}
 </div>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Methodology Note */}
 <div className="glass-card bg-white p-6 rounded-[24px] border border-slate-200">
 <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
 <Info className="w-4 h-4 text-slate-400" />
 Scoring Methodology
 </h4>
 <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
 The Health Scorecard evaluates nations based on normalized dataset benchmarks. 
 <strong> Grade A</strong> represents performance in the top 15th percentile globally. 
 <strong> Grade F</strong> signifies a deviation of more than 2 standard units from the mean. 
 Data is recalculated every 24 hours based on the latest verified reports from partner NGOs and government portals.
 </p>
 </div>
 </div>
 </AppLayout>
 );
};

export default Scorecard;

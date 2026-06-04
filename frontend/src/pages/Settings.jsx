import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Globe, User, Shield, Save, CheckCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const Settings = () => {
 const [saveSuccess, setSaveSuccess] = useState(false);
 const [preferences, setPreferences] = useState({
 notifications: true,
 defaultRegion: 'All',
 riskThreshold: 25,
 emailAlerts: false
 });

 const handleSave = () => {
 localStorage.setItem('userPreferences', JSON.stringify(preferences));
 setSaveSuccess(true);
 setTimeout(() => setSaveSuccess(false), 3000);
 };

 return (
 <AppLayout>
 <div className="max-w-4xl mx-auto space-y-8">
 <header>
 <div className="flex items-center space-x-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-2">
 <SettingsIcon className="w-4 h-4" />
 <span>Control Center</span>
 </div>
 <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em]">Application Settings</h1>
 <p className="text-slate-500">Configure your global monitoring preferences and alert thresholds.</p>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="md:col-span-1 space-y-4">
 <nav className="space-y-1">
 <button className="w-full flex items-center gap-3 px-5 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm border border-blue-100">
 <Globe className="w-4 h-4" />
 <span>General</span>
 </button>
 </nav>
 </div>

 <div className="md:col-span-2 space-y-6">
 <div className="glass-card p-8 rounded-[24px] space-y-8">
 <section className="space-y-4">
 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
 <Globe className="w-4 h-4 text-blue-600" />
 Region & Data Defaults
 </h3>
 <div className="grid grid-cols-1 gap-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Monitoring Region</label>
 <select 
 value={preferences.defaultRegion}
 onChange={(e) => setPreferences({...preferences, defaultRegion: e.target.value})}
 className="w-full bg-white rounded-[14px] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="All">Global (All Regions)</option>
 <option value="Americas">Americas</option>
 <option value="Europe">Europe</option>
 <option value="Asia">Asia</option>
 <option value="Africa">Africa</option>
 </select>
 </div>
 </div>
 </section>

 <section className="space-y-4">
 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
 <Bell className="w-4 h-4 text-amber-500" />
 Alert Thresholds
 </h3>
 <div className="space-y-6">
 <div>
 <div className="flex justify-between mb-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">YoY Growth Trigger (%)</label>
 <span className="text-xs font-bold text-blue-600">{preferences.riskThreshold}%</span>
 </div>
 <input 
 type="range" 
 min="5" 
 max="100" 
 step="5"
 value={preferences.riskThreshold}
 onChange={(e) => setPreferences({...preferences, riskThreshold: parseInt(e.target.value)})}
 className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
 />
 <p className="text-[10px] text-slate-400 mt-2 italic">Alerts will be generated when disease prevalence grows beyond this threshold.</p>
 </div>
 </div>
 </section>

 <div className="pt-6 border-t border-slate-100 flex justify-end">
 <button 
 onClick={handleSave}
 className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95-lg ${saveSuccess ? 'bg-green-600 text-white-green-900/20' : 'bg-blue-600 text-white-slate-900/20'}`}
 >
 {saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
 <span>{saveSuccess ? 'Changes Saved' : 'Save Preferences'}</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </AppLayout>
 );
};

export default Settings;

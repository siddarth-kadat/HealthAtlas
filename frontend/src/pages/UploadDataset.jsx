import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const MAX_DATASET_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

const UploadDataset = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [file, setFile] = useState(null);
 const [dragActive, setDragActive] = useState(false);
 const [fileInputKey, setFileInputKey] = useState(0);

 useEffect(() => {
 // Basic role protection
 if (user && user.role !== 'admin') {
 navigate('/dashboard');
 }
 }, [user, navigate]);

 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState('idle');
 const [message, setMessage] = useState('');

 const selectFile = (selectedFile) => {
 if (selectedFile) {
 setStatus('idle');
 setMessage('');

 if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
 setFile(null);
 setStatus('error');
 setMessage('Please upload a CSV file matching the required healthstats format.');
 return;
 }

 if (selectedFile.size > MAX_DATASET_UPLOAD_SIZE_BYTES) {
 setFile(null);
 setStatus('error');
 setMessage('File is too large. Maximum dataset upload size is 50MB.');
 return;
 }

 setFile(selectedFile);
 }
 };

 const handleFileChange = (e) => {
 selectFile(e.target.files?.[0]);
 };

 const handleDragOver = (e) => {
 e.preventDefault();
 setDragActive(true);
 };

 const handleDragLeave = () => {
 setDragActive(false);
 };

 const handleDrop = (e) => {
 e.preventDefault();
 setDragActive(false);
 selectFile(e.dataTransfer.files?.[0]);
 };

 const handleUpload = async () => {
 if (!file) return;
 setLoading(true);
 setStatus('idle');
 
 const formData = new FormData();
 formData.append('dataset', file);

 try {
 const res = await api.post('/upload/csv', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 setStatus('success');
 setMessage(`${res.data.msg}. Added ${res.data.count} rows.`);
 setFile(null);
 setFileInputKey((key) => key + 1);
 } catch (err) {
 setStatus('error');
 setMessage(err.response?.data?.msg || 'Upload failed');
 } finally {
 setLoading(false);
 }
 };

 return (
 <AppLayout>
 <div className="max-w-4xl mx-auto w-full min-w-0 space-y-8">
 <header className="mb-8 text-center sm:text-left min-w-0">
 <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em] break-words">Upload Dataset</h1>
 <p className="text-slate-500 mt-2 break-words">Append new health statistics from CSV files.</p>
 </header>

 <div className="glass-card border border-slate-200 rounded-[2rem] p-6 sm:p-8 lg:p-12 min-w-0 overflow-hidden">
 <div 
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 className={`border-2 border-dashed rounded-[2rem] p-8 sm:p-12 text-center transition-all ${
 file || dragActive ? 'border-blue-400 bg-blue-50/70' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
 }`}
 >
 <input 
 key={fileInputKey}
 type="file" 
 id="dataset-upload" 
 className="hidden" 
 accept=".csv"
 onChange={handleFileChange}
 />
 <label htmlFor="dataset-upload" className="cursor-pointer block">
 <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
 {file ? <FileText className="w-10 h-10 text-blue-600" /> : <Upload className="w-10 h-10" />}
 </div>
 <h3 className="text-xl font-bold text-slate-900 mb-2 break-words">
 {file ? file.name : 'Select Dataset File'}
 </h3>
 <p className="text-slate-500 text-sm max-w-xs mx-auto break-words">
 Drag and drop your file here, or click to browse. Supports CSV format.
 </p>
 </label>
 </div>

 <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 min-w-0">
 <div className="space-y-4 min-w-0 w-full">
 <div className="space-y-1">
 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider break-words">Required Schema</h4>
 <p className="text-xs text-slate-500 font-medium mb-2 break-words">CSV must contain these exact column headers:</p>
 <div className="bg-slate-50 rounded p-2 text-[10px] font-mono text-slate-600 whitespace-normal break-words leading-relaxed max-w-full">
 Country, Year, Disease Name, Disease Category, Prevalence Rate (%), Incidence Rate (%), Mortality Rate (%), Age Group, Gender, Population Affected, Healthcare Access (%), Doctors per 1000, Hospital Beds per 1000, Treatment Type, Average Treatment Cost (USD), Availability of Vaccines/Treatment, Recovery Rate (%), DALYs, Improvement in 5 Years (%), Per Capita Income (USD), Education Index, Urbanization Rate (%)
 </div>
 </div>
 <ul className="text-xs text-slate-500 space-y-1 italic break-words">
 <li>• Example row matching your Kaggle WHO dataset</li>
 <li>• Format: .csv (with headers exactly as shown above)</li>
 <li>• Max file size: 50MB</li>
 </ul>
 </div>

 <button 
 onClick={handleUpload}
 disabled={!file || loading}
 className="w-full lg:w-auto lg:shrink-0 px-6 sm:px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all-xl-blue-500/20 flex items-center justify-center gap-3 text-center"
 >
 {loading ? (
 <>
 <Loader2 className="w-5 h-5 animate-spin" />
 <span>Processing...</span>
 </>
 ) : (
 <>
 <CheckCircle className="w-5 h-5" />
 <span>Upload & Append</span>
 </>
 )}
 </button>
 </div>

 {status !== 'idle' && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className={`mt-8 p-6 rounded-3xl flex items-start gap-4 min-w-0 ${
 status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
 }`}
 >
 {status === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
 <div className="min-w-0">
 <p className="font-bold break-words">{status === 'success' ? 'Upload Successful' : 'Upload Failed'}</p>
 <p className="text-sm opacity-90 break-words">{message}</p>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 </AppLayout>
 );
};

export default UploadDataset;

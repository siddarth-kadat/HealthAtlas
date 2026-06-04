import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, BarChart3, Trash2, Loader2, CheckCircle, Copy, Globe, Lock, GripVertical, Edit2, BookOpen, PlusCircle } from 'lucide-react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import StoryChartBlock from '../components/StoryChartBlock';
import { createChartBlockContent, sanitizeStoryBlocks } from '../utils/storyCharts';

const createEmptyStory = () => ({
 storyId: null,
 blocks: [
 { id: 1, type: 'text', content: 'Global Health Trends: A 2025 Retrospective' }
 ],
 title: 'My Global Health Story',
 theme: '#3b82f6',
 status: 'DRAFT',
 isPublic: false,
 publicUrl: '',
 lastSavedTime: null
});

const StoryMode = () => {
 const [storyId, setStoryId] = useState(createEmptyStory().storyId);
 const [blocks, setBlocks] = useState(createEmptyStory().blocks);
 const [title, setTitle] = useState(createEmptyStory().title);
 const [theme, setTheme] = useState(createEmptyStory().theme);
 const [status, setStatus] = useState(createEmptyStory().status);
 const [isPublic, setIsPublic] = useState(createEmptyStory().isPublic);
 const [isSaving, setIsSaving] = useState(false);
 const [lastSavedTime, setLastSavedTime] = useState(createEmptyStory().lastSavedTime);
 const [publicUrl, setPublicUrl] = useState(createEmptyStory().publicUrl);
 const [draggedBlock, setDraggedBlock] = useState(null);
 const [chartMetadata, setChartMetadata] = useState(null);
 const [userStories, setUserStories] = useState([]);
 const [storiesLoading, setStoriesLoading] = useState(true);
 const [activeStoryLoading, setActiveStoryLoading] = useState(false);
 const saveTimeoutRef = useRef(null);

 const themeColors = [
 '#3b82f6', // blue
 '#10b981', // emerald
 '#f59e0b', // amber
 '#ef4444' // red
 ];

 const applyStory = (story) => {
 setStoryId(story?._id || null);
 setBlocks(Array.isArray(story?.blocks) && story.blocks.length > 0 ? story.blocks : createEmptyStory().blocks);
 setTitle(story?.title || createEmptyStory().title);
 setTheme(story?.theme || createEmptyStory().theme);
 setStatus(story?.status || createEmptyStory().status);
 setIsPublic(Boolean(story?.isPublic));
 setLastSavedTime(story?.updatedAt ? new Date(story.updatedAt) : null);
 setPublicUrl(story?.slug && story?.isPublic && story?.status === 'PUBLISHED' ? `${window.location.origin}/story/${story.slug}` : '');
 };

 const resetEditor = () => {
 applyStory(null);
 };

 const refreshUserStories = async () => {
 try {
 setStoriesLoading(true);
 const response = await api.get('/stories/user/my-stories');
 setUserStories(Array.isArray(response.data) ? response.data : []);
 } catch (err) {
 console.error('Error fetching user stories:', err);
 } finally {
 setStoriesLoading(false);
 }
 };

 const addBlock = (type) => {
 const newBlock = {
 id: Date.now(),
 type,
 content: type === 'text' ? 'Enter your text or insight here...' : createChartBlockContent()
 };
 setBlocks([...blocks, newBlock]);
 };

 const removeBlock = (id) => {
 setBlocks(blocks.filter(b => b.id !== id));
 };

 const updateBlockContent = (id, content) => {
 setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
 };

 const handleDragStart = (id) => {
 setDraggedBlock(id);
 };

 const handleDragOver = (e) => {
 e.preventDefault();
 };

 const handleDrop = (targetId) => {
 if (!draggedBlock || draggedBlock === targetId) return;

 const draggedIdx = blocks.findIndex(b => b.id === draggedBlock);
 const targetIdx = blocks.findIndex(b => b.id === targetId);

 const newBlocks = [...blocks];
 const [draggedItem] = newBlocks.splice(draggedIdx, 1);
 newBlocks.splice(targetIdx, 0, draggedItem);

 setBlocks(newBlocks);
 setDraggedBlock(null);
 };

 useEffect(() => {
 const fetchInitialData = async () => {
 try {
 const [chartResponse, storiesResponse] = await Promise.all([
 api.get('/dashboard/summary'),
 api.get('/stories/user/my-stories')
 ]);
 setChartMetadata(chartResponse.data);
 setUserStories(Array.isArray(storiesResponse.data) ? storiesResponse.data : []);
 } catch (err) {
 console.error('Error fetching story mode data:', err);
 } finally {
 setStoriesLoading(false);
 }
 };

 fetchInitialData();
 }, []);

 // Auto-save functionality
 useEffect(() => {
 // Only auto-save if story exists and we have changes
 if (!storyId) return;

 // Clear existing timeout
 if (saveTimeoutRef.current) {
 clearTimeout(saveTimeoutRef.current);
 }

 setIsSaving(true);

 // Set timeout for debounced auto-save (2 seconds of inactivity)
 saveTimeoutRef.current = setTimeout(async () => {
 try {
 const payload = {
 title: String(title || ''),
 blocks: sanitizeStoryBlocks(blocks),
 theme: String(theme || '#3b82f6'),
 status: 'DRAFT', // Auto-save always as draft
 isPublic: isPublic // Keep current visibility
 };

 await api.put(`/stories/${storyId}`, payload);
 setLastSavedTime(new Date());
 } catch (err) {
 console.error('Auto-save error:', err);
 } finally {
 setIsSaving(false);
 }
 }, 2000); // Debounce for 2 seconds

 return () => {
 if (saveTimeoutRef.current) {
 clearTimeout(saveTimeoutRef.current);
 }
 };
 }, [blocks, title, theme, storyId, isPublic]);

 const handlePublish = async () => {
 try {
 setIsSaving(true);

 const payload = {
 title: String(title || ''),
 blocks: sanitizeStoryBlocks(blocks),
 theme: String(theme || '#3b82f6'),
 status: 'PUBLISHED',
 isPublic: true
 };

 console.log('Publishing story with payload:', payload);

 if (storyId) {
 console.log('Publishing existing story:', storyId);
 const res = await api.put(`/stories/${storyId}`, payload);
 console.log('Publish response:', res.data);
 setStatus('PUBLISHED');
 setIsPublic(true);
 setPublicUrl(`${window.location.origin}/story/${res.data.slug}`);
 } else {
 console.log('Creating and publishing new story');
 const res = await api.post('/stories', payload);
 console.log('Create response:', res.data);
 setStoryId(res.data._id);
 setStatus('PUBLISHED');
 setIsPublic(true);
 const urlToSet = `${window.location.origin}/story/${res.data.slug}`;
 console.log('Setting URL to:', urlToSet);
 setPublicUrl(urlToSet);
 }

 await refreshUserStories();
 setLastSavedTime(new Date());
 } catch (err) {
 console.error('Error publishing story:', err);
 console.error('Error response:', err.response?.data);
 alert('Error publishing story: ' + (err.response?.data?.msg || err.message));
 } finally {
 setIsSaving(false);
 }
 };

 const handleUnpublish = async () => {
 try {
 setIsSaving(true);

 const payload = {
 title: String(title || ''),
 blocks: sanitizeStoryBlocks(blocks),
 theme: String(theme || '#3b82f6'),
 status: 'DRAFT',
 isPublic: false
 };

 if (storyId) {
 await api.put(`/stories/${storyId}`, payload);
 }
 
 setStatus('DRAFT');
 setIsPublic(false);
 setPublicUrl('');
 setLastSavedTime(new Date());
 await refreshUserStories();
 } catch (err) {
 console.error('Error unpublishing story:', err);
 alert('Error unpublishing story: ' + (err.response?.data?.msg || err.message));
 } finally {
 setIsSaving(false);
 }
 };

 const copyToClipboard = () => {
 navigator.clipboard.writeText(publicUrl);
 alert('Story URL copied to clipboard!');
 };

 const openStory = async (id) => {
 try {
 setActiveStoryLoading(true);
 const response = await api.get(`/stories/user/my-stories/${id}`);
 applyStory(response.data);
 } catch (err) {
 console.error('Error opening story:', err);
 alert('Unable to open this article right now.');
 } finally {
 setActiveStoryLoading(false);
 }
 };

 const handleDeleteStory = async (id) => {
 const targetStory = userStories.find((story) => story._id === id);
 const confirmed = window.confirm(`Delete "${targetStory?.title || 'this story'}"? This cannot be undone.`);
 if (!confirmed) return;

 try {
 await api.delete(`/stories/${id}`);
 if (storyId === id) {
 resetEditor();
 }
 await refreshUserStories();
 } catch (err) {
 console.error('Error deleting story:', err);
 alert('Unable to delete this article right now.');
 }
 };

 return (
 <AppLayout>
 <div className="max-w-7xl mx-auto space-y-8">
 {/* Header */}
 <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
 <div className="flex-1 space-y-3">
 <input 
 className="text-4xl font-extrabold text-slate-900 bg-transparent border-b-2 outline-none focus:border-blue-500 pb-2 w-full transition-colors tracking-[-0.04em]"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="Enter story title..."
 />
 <p className="text-slate-500 font-medium">Curate and publish health data narratives.</p>
 </div>
 <button 
 onClick={status === 'PUBLISHED' ? handleUnpublish : handlePublish}
 disabled={isSaving}
 className={`px-6 py-3 ${status === 'PUBLISHED' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-2xl font-bold text-sm-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap`}
 >
 {isSaving ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Publishing...</span>
 </>
 ) : (
 <>
 <Edit2 className="w-4 h-4" />
 <span>{status === 'PUBLISHED' ? 'Unpublish Story' : 'Publish Story'}</span>
 </>
 )}
 </button>
 </header>

 {/* Public URL Display */}
 {publicUrl && (
 <motion.div 
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="border border-blue-200 rounded-xl p-4 flex items-center justify-between"
 style={{ background: 'linear-gradient(to right, #eff6ff, #dbeafe)' }}
 >
 <div>
 <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Public Story URL</p>
 <p className="text-sm text-blue-900 font-mono">{publicUrl}</p>
 </div>
 <button 
 onClick={copyToClipboard}
 className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
 title="Copy to clipboard"
 >
 <Copy className="w-4 h-4" />
 </button>
 </motion.div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
 {/* Story Content Editor */}
 <div className="lg:col-span-3 space-y-4">
 {activeStoryLoading && (
 <div className="glass-card rounded-xl px-4 py-3 text-sm font-medium text-blue-700 flex items-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin" />
 Loading selected article...
 </div>
 )}
 <AnimatePresence mode="popLayout">
 {blocks.map((block, idx) => (
 <motion.div 
 key={block.id}
 layout
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative group"
 draggable
 onDragStart={() => handleDragStart(block.id)}
 onDragOver={handleDragOver}
 onDrop={() => handleDrop(block.id)}
 >
 {/* Drag Handle */}
 <button 
 className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
 title="Drag to reorder"
 >
 <GripVertical className="w-4 h-4" />
 </button>

 <div style={{ borderColor: theme, borderWidth: '2px', minHeight: '100px' }} className="glass-card p-6 rounded-[24px] transition-all hover:shadow-md">
 {block.type === 'text' ? (
 <textarea 
 className={`w-full bg-transparent border-none outline-none resize-none placeholder:text-slate-300 ${idx === 0 ? 'text-3xl font-bold' : 'text-base text-slate-700'}`}
 placeholder={idx === 0 ? "Story title..." : "Write your narrative here..."}
 value={block.content}
 onChange={(e) => updateBlockContent(block.id, e.target.value)}
 rows={idx === 0 ? 2 : 4}
 />
 ) : (
 <StoryChartBlock
 content={block.content}
 editable
 onChange={(nextContent) => updateBlockContent(block.id, nextContent)}
 metadata={chartMetadata}
 themeColor={theme}
 />
 )}
 </div>

 {/* Delete Button */}
 <button 
 onClick={() => removeBlock(block.id)}
 className="absolute -top-3 -right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all-lg hover:scale-110"
 title="Delete block"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </motion.div>
 ))}
 </AnimatePresence>

 {/* Add Block Section */}
 <div className="flex gap-3 pt-4">
 <button 
 onClick={() => addBlock('text')}
 className="flex-1 py-3 px-4 bg-white hover:bg-blue-50 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200"
 >
 <Type className="w-4 h-4" />
 Add Text Block
 </button>
 <button 
 onClick={() => addBlock('chart')}
 className="flex-1 py-3 px-4 bg-white hover:bg-blue-50 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200"
 >
 <BarChart3 className="w-4 h-4" />
 Add Chart Block
 </button>
 </div>
 </div>

 {/* Narrative Settings Panel */}
 <div className="lg:col-span-2 space-y-6">
 <div className="glass-card p-6 rounded-[24px]">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">My Articles</h3>
 <button
 onClick={resetEditor}
 className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
 >
 <PlusCircle className="w-3.5 h-3.5" />
 New
 </button>
 </div>
 <div className="space-y-3">
 {storiesLoading ? (
 <div className="rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500 flex items-center justify-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin" />
 Loading your articles...
 </div>
 ) : userStories.length === 0 ? (
 <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
 No saved articles yet. Publish one and it will appear here.
 </div>
 ) : userStories.map((story) => (
 <div
 key={story._id}
 className={`rounded-xl border p-4 transition-colors ${storyId === story._id ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}
 >
 <button
 onClick={() => openStory(story._id)}
 className="w-full text-left"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <p className="font-bold text-slate-900 line-clamp-1">{story.title}</p>
 <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
 <BookOpen className="w-3 h-3" />
 {story.status} {story.isPublic ? '• Public' : '• Private'}
 </p>
 </div>
 <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${story.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
 {story.status}
 </span>
 </div>
 <p className="text-[11px] text-slate-400 mt-3">
 Updated {new Date(story.updatedAt).toLocaleDateString()}
 </p>
 </button>
 <div className="mt-3 flex items-center gap-2">
 <button
 onClick={() => openStory(story._id)}
 className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
 >
 Open
 </button>
 <button
 onClick={() => handleDeleteStory(story._id)}
 className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
 >
 Delete
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Auto-Save Status */}
 <div className="glass-card p-6 rounded-[24px]">
 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Auto-Save Status</h3>
 <div className="space-y-3">
 <div className={`px-4 py-2.5 rounded-lg text-center font-bold text-sm flex items-center justify-center gap-2 ${isSaving ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
 {isSaving ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Saving changes...</span>
 </>
 ) : (
 <>
 <CheckCircle className="w-4 h-4" />
 <span>Auto-saved</span>
 </>
 )}
 </div>
 {lastSavedTime && (
 <p className="text-xs text-slate-500 text-center">
 Last saved: {lastSavedTime.toLocaleTimeString()}
 </p>
 )}
 </div>
 </div>

 {/* Publishing Status */}
 <div className="glass-card p-6 rounded-[24px]">
 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Publishing Status</h3>
 <div className={`px-4 py-2.5 rounded-lg text-center font-bold text-sm ${status === 'DRAFT' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
 {status}
 </div>
 </div>

 {/* Visibility */}
 <div className="glass-card p-6 rounded-[24px]">
 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Visibility</h3>
 <label className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-slate-50 rounded-xl transition-colors">
 <input 
 type="checkbox"
 checked={isPublic}
 onChange={(e) => setIsPublic(e.target.checked)}
 className="w-4 h-4 rounded"
 />
 <div className="flex-1">
 <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
 {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
 {isPublic ? 'Public' : 'Private'}
 </p>
 <p className="text-xs text-slate-500 mt-0.5">
 {isPublic ? 'Anyone with the link can view' : 'Only you can view'}
 </p>
 </div>
 </label>
 </div>

 {/* Theme Color */}
 <div className="glass-card p-6 rounded-[24px]">
 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Theme Color</h3>
 <div className="grid grid-cols-4 gap-3">
 {themeColors.map((color) => (
 <button 
 key={color}
 onClick={() => setTheme(color)}
 style={{ backgroundColor: color }}
 className={`h-12 rounded-xl transition-all ${theme === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-105' : 'hover:scale-110'}`}
 />
 ))}
 </div>
 </div>

 {/* Story Info */}
 <div className="glass-card p-6 rounded-[24px] border border-slate-200">
 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Story Info</h3>
 <div className="space-y-3 text-sm">
 <div className="flex justify-between">
 <span className="text-slate-600">Blocks</span>
 <span className="font-bold text-slate-900">{blocks.length}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-600">Words</span>
 <span className="font-bold text-slate-900">
 {blocks.reduce((sum, b) => sum + (b.type === 'text' ? b.content.split(' ').length : 0), 0)}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-600">Status</span>
 <span className={`font-bold ${status === 'DRAFT' ? 'text-amber-600' : 'text-green-600'}`}>
 {status}
 </span>
 </div>
 </div>
 </div>

 <div className="p-6 bg-blue-50 rounded-[24px] border border-blue-100 text-center">
 <p className="text-xs text-blue-700 font-medium leading-relaxed">
 Stories are auto-saved to draft. Click "Publish Story" to make them public with a shareable link.
 </p>
 </div>
 </div>
 </div>
 </div>
 </AppLayout>
 );
};

export default StoryMode;

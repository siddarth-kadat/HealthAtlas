import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../services/api';
import StoryChartBlock from '../components/StoryChartBlock';

const PublicStory = () => {
 const { slug } = useParams();
 const [story, setStory] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
 const fetchStory = async () => {
 try {
 setLoading(true);
 const res = await api.get(`/stories/${slug}`);
 
 // Check if story is actually public and published
 if (!res.data.isPublic || res.data.status !== 'PUBLISHED') {
 setError('This story is not publicly available');
 setStory(null);
 } else {
 setStory(res.data);
 setError(null);
 }
 } catch (err) {
 console.error('Error fetching story:', err);
 setError(err.response?.data?.message || 'Story not found or not public');
 setStory(null);
 } finally {
 setLoading(false);
 }
 };

 if (slug) {
 fetchStory();
 }
 }, [slug]);

 if (loading) {
 return (
 <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
 <div className="text-center space-y-4">
 <div className="inline-block p-4 glass-card rounded-2xl-lg">
 <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
 </div>
 <p className="text-slate-600 font-medium">Loading story...</p>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
 <div className="max-w-md w-full glass-card rounded-[28px] p-8 space-y-4">
 <div className="flex justify-center">
 <div className="p-3 bg-red-50 rounded-full">
 <AlertCircle className="w-8 h-8 text-red-600" />
 </div>
 </div>
 <h1 className="text-2xl font-bold text-slate-900 text-center">Story Not Found</h1>
 <p className="text-slate-600 text-center">{error}</p>
 <button
 onClick={() => window.history.back()}
 className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
 >
 <ArrowLeft className="w-4 h-4" />
 Go Back
 </button>
 </div>
 </div>
 );
 }

 if (!story) {
 return (
 <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
 <div className="text-center space-y-4">
 <p className="text-slate-600 font-medium">No story available</p>
 </div>
 </div>
 );
 }

 const themeColor = story.theme || '#3b82f6';

 return (
 <div className="min-h-screen bg-[#F5F7FB]">
 {/* Header */}
 <div className="sticky top-0 z-40 glass-nav border-b">
 <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
 <button
 onClick={() => window.history.back()}
 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
 title="Go back"
 >
 <ArrowLeft className="w-5 h-5 text-slate-600" />
 </button>
 <h1 className="text-2xl font-extrabold text-slate-900 flex-1 line-clamp-1 tracking-[-0.04em]">{story.title}</h1>
 </div>
 </div>

 {/* Main Content */}
 <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
 {/* Story Metadata */}
 <div className="glass-card rounded-[24px] p-6 space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="space-y-2">
 <p className="text-sm text-slate-500 font-medium">Published Story</p>
 <h2 className="text-2xl font-extrabold text-slate-900 tracking-[-0.035em]">{story.title}</h2>
 {story.description && (
 <p className="text-slate-600">{story.description}</p>
 )}
 </div>
 <div className="flex items-center gap-2">
 <div
 className="w-12 h-12 rounded-lg-md border-2"
 style={{ backgroundColor: themeColor, borderColor: themeColor }}
 ></div>
 <div className="text-right">
 <p className="text-xs text-slate-500 font-medium">Theme</p>
 <p className="text-sm font-mono text-slate-700">{themeColor}</p>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
 <div className="space-y-1">
 <p className="text-xs text-slate-500 font-medium uppercase">Created</p>
 <p className="text-sm font-semibold text-slate-900">
 {new Date(story.createdAt).toLocaleDateString()}
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-xs text-slate-500 font-medium uppercase">Blocks</p>
 <p className="text-sm font-semibold text-slate-900">{story.blocks?.length || 0}</p>
 </div>
 </div>
 </div>

 {/* Story Blocks */}
 {story.blocks && story.blocks.length > 0 ? (
 <div className="space-y-6">
 {story.blocks.map((block, idx) => (
 <div
 key={idx}
 style={{ borderColor: themeColor, borderWidth: '2px' }}
 className="glass-card rounded-[24px] hover:shadow-md transition-overflow-hidden"
 >
 {block.type === 'text' ? (
 <div className="p-8 space-y-4">
 {idx === 0 ? (
 <h3 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-[-0.04em]">
 {block.content}
 </h3>
 ) : (
 <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
 {block.content}
 </p>
 )}
 </div>
 ) : (
 <div className="p-8 space-y-4">
 <StoryChartBlock
 content={block.content}
 themeColor={themeColor}
 />
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="glass-card rounded-[24px] p-12 text-center space-y-4">
 <p className="text-slate-500 font-medium">No blocks in this story</p>
 </div>
 )}

 {/* Footer */}
 <div className="glass-card rounded-[24px] p-6 text-center space-y-2">
 <p className="text-sm text-slate-500">
 Last updated: {new Date(story.updatedAt).toLocaleDateString()} at {new Date(story.updatedAt).toLocaleTimeString()}
 </p>
 <p className="text-xs text-slate-400">This is a published story by HealthAtlas</p>
 </div>
 </div>
 </div>
 );
};

export default PublicStory;

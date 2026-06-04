import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, X, Maximize2, Minimize2, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HealthChatbot = () => {
 const { user } = useAuth();
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([
 { role: 'bot', text: "Hello! I am your HealthAtlas Assistant. How can I help you analyze global health data today?" }
 ]);
 const [input, setInput] = useState('');
 const [isTyping, setIsTyping] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages]);

 const handleSend = async () => {
 if (!input.trim()) return;

 const userMessage = { role: 'user', text: input };
 setMessages(prev => [...prev, userMessage]);
 const currentInput = input;
 setInput('');
 setIsTyping(true);

 try {
 let context = null;
 try {
 const summaryRes = await api.get('/dashboard/summary');
 context = summaryRes.data;
 } catch (e) {
 console.warn('Could not fetch summary context');
 }

 const response = await api.post('/chat', {
 message: currentInput,
 context
 });

 const botMessage = { role: 'bot', text: response.data.text || "I'm sorry, I couldn't process that request." };
 setMessages(prev => [...prev, botMessage]);
 } catch (err) {
 console.error('Chat error:', err);
 const errorMsg = err.response?.data?.msg || err.message || "Failed to connect to the AI system.";
 
 setMessages(prev => [...prev, { 
 role: 'bot', 
 text: `I'm having trouble connecting to the AI system right now. \n\n**Error details:** ${errorMsg}`
 }]);
 } finally {
 setIsTyping(false);
 }
 };

 if (!user) return null;

 return (
 <motion.div 
 drag
 dragMomentum={false}
 dragElastic={0.1}
 className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none"
 dragConstraints={{ 
 left: -window.innerWidth + 450, 
 right: 0, 
 top: -window.innerHeight + 650, 
 bottom: 0 
 }}
 >
 <div className="pointer-events-auto flex flex-col items-end">
 {/* Chat Window */}
 <AnimatePresence>
 {isOpen && (
 <motion.div 
 initial={{ opacity: 0, y: 20, scale: 0.9, originX: 0.9, originY: 1 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 20, scale: 0.9 }}
 className="mb-4 w-96 max-h-svh glass-card rounded-[2rem] border border-slate-200 flex flex-col overflow-hidden"
 style={{ height: '550px' }}
 >
 {/* Header */}
 <div className="p-6 text-white flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #2196F3, #4F46E5)' }}>
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 glass-card/20 rounded-xl flex items-center justify-center">
 <Bot className="w-6 h-6" />
 </div>
 <div>
 <h3 className="font-bold">Health Assistant</h3>
 <p className="text-xs text-blue-100 italic">AI Powered Analysis</p>
 </div>
 </div>
 <button 
 onClick={() => setIsOpen(false)}
 className="p-2 hover:glass-card/10 rounded-lg transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Messages Area */}
 <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F5F7FB]">
 {messages.map((msg, i) => (
 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
 msg.role === 'user' 
 ? 'bg-blue-600 text-white rounded-tr-none-md' 
 : 'bg-white text-zinc-900 rounded-tl-none border border-zinc-100'
 }`}>
 {msg.role === 'bot' ? (
 <div className="markdown-body">
 <ReactMarkdown>{msg.text}</ReactMarkdown>
 </div>
 ) : (
 msg.text
 )}
 </div>
 </div>
 ))}
 {isTyping && (
 <div className="flex justify-start">
 <div className="glass-card p-4 rounded-2xl rounded-tl-none border border-zinc-100">
 <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <div className="p-6 bg-white border-t border-slate-200">
 <div className="relative">
 <input 
 type="text" 
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && handleSend()}
 placeholder="Ask about trends, predictions..."
 className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
 />
 <button 
 onClick={handleSend}
 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
 >
 <Send className="w-4 h-4" />
 </button>
 </div>
 <p className="text-[10px] text-zinc-400 mt-3 text-center uppercase tracking-widest font-bold">HealthAtlas v1.0 AI System</p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Floating Button */}
 <motion.button 
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setIsOpen(!isOpen)}
 className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center group cursor-grab active:cursor-grabbing shadow-xl shadow-blue-500/30"
 >
 <AnimatePresence mode="wait">
 {isOpen ? (
 <motion.div
 key="close"
 initial={{ rotate: -90, opacity: 0 }}
 animate={{ rotate: 0, opacity: 1 }}
 exit={{ rotate: 90, opacity: 0 }}
 >
 <X className="w-8 h-8" />
 </motion.div>
 ) : (
 <motion.div
 key="bot"
 initial={{ rotate: 90, opacity: 0 }}
 animate={{ rotate: 0, opacity: 1 }}
 exit={{ rotate: -90, opacity: 0 }}
 className="flex items-center justify-center"
 >
 <Bot className="w-8 h-8 group-hover:hidden" />
 <Sparkles className="w-8 h-8 hidden group-hover:block animate-pulse" />
 </motion.div>
 )}
 </AnimatePresence>
 </motion.button>
 </div>
 </motion.div>

 );
};

export default HealthChatbot;

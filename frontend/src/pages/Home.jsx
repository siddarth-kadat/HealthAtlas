import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, ShieldCheck, BarChart, ArrowRight, Activity, Zap, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-11 h-11 bg-gradient-to-br from-[#2196F3] to-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ha-float">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">HealthAtlas</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#insights" className="hover:text-blue-600 transition-colors">Insights</a>
            <Link to="/login" className="px-5 py-2.5 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-zinc-200 transition-all">Login</Link>
            <Link to="/register" className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 font-semibold">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Zap className="w-3 h-3" />
              <span>Real-time Global Health Intelligence</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold text-zinc-900 leading-[1.1] tracking-tight">
              Visualize the <span className="ha-gradient-text">Pulse</span> of Global Health.
            </h1>
            <p className="text-xl text-zinc-500 max-w-lg leading-relaxed">
              Aggregation system for worldwide disease data. Gain instant insights with interactive dashboards, AI-powered predictions, and real-time alerts.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 group">
                <span>Start Exploring</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold text-lg border border-zinc-200 hover:bg-zinc-200 shadow-sm transition-all text-center">
                View Public Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-tr from-blue-100 to-blue-50 rounded-[3rem] absolute inset-0 blur-3xl transform -rotate-6"></div>
            <div className="relative glass-card ha-tilt ha-premium-panel p-8 rounded-[3rem] overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-64 h-64 text-blue-600" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 text-xs font-bold text-zinc-400 uppercase">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span>Global Alert: Pandemic Risk High</span>
                  </div>
                  <div className="text-zinc-400 text-sm italic">Updated 2m ago</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="ha-soft-blue p-6 rounded-3xl border border-blue-100 shadow-lg shadow-blue-500/5">
                    <Activity className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold">195+</div>
                    <div className="text-xs text-zinc-500">Countries tracked</div>
                  </div>
                  <div className="ha-soft-green p-6 rounded-3xl border border-green-100 shadow-lg shadow-emerald-500/5">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-xs text-zinc-500">Data accuracy</div>
                  </div>
                </div>

                <div className="h-48 bg-slate-50/80 rounded-3xl p-6 flex flex-col justify-end space-y-4 shadow-inner">
                  <div className="flex items-end space-x-2 h-full">
                    {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex-1 bg-blue-500/20 rounded-t-lg group-hover:bg-blue-500 transition-colors"
                      ></motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    <span>JAN</span>
                    <span>MAY</span>
                    <span>OCT</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#F5F7FB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-zinc-900">Powerful Analytics for Public Health</h2>
            <p className="text-zinc-500">Comprehensive suite of tools designed for health officials, researchers, and global organizations.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Global Map', desc: 'Interactive choropleth maps displaying disease clustering and prevalence worldwide.' },
              { icon: BarChart, title: 'AI Predictions', desc: 'Predictive modeling engine for future disease outbreaks and healthcare demands.' },
              { icon: Zap, title: 'Real-time Alerts', desc: 'Intelligent alerting system that detects anomalies in health data reporting.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card ha-tilt p-8 rounded-[2rem]"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-24 bg-white/70 border-t border-slate-200 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-3 h-3" />
                <span>Actionable Insights</span>
              </div>
              <h2 className="text-4xl font-bold text-zinc-900 leading-tight">Turn outbreak signals into clear next steps.</h2>
              <p className="text-zinc-500 leading-relaxed">
                HealthAtlas highlights trend shifts, at-risk regions, and disease patterns so teams can focus attention where it matters most.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: TrendingUp, value: 'Early', label: 'trend detection', tone: 'ha-soft-blue', color: 'text-blue-600' },
                { icon: ShieldCheck, value: 'Risk', label: 'priority scoring', tone: 'ha-soft-green', color: 'text-emerald-600' },
                { icon: BarChart, value: 'Live', label: 'comparative analytics', tone: 'ha-soft-orange', color: 'text-amber-600' }
              ].map((insight, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className={`${insight.tone} glass-card ha-tilt p-6 rounded-[2rem] border border-slate-200`}
                >
                  <insight.icon className={`w-7 h-7 ${insight.color} mb-5`} />
                  <div className="text-3xl font-bold text-zinc-900 mb-1">{insight.value}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">{insight.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

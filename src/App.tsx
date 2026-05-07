import React, { useState, useEffect, useRef } from 'react';
import uosLogo from './assets/imgi_3_logo - Copy.png';
import axios from 'axios';
import {
  Menu, Plus, MessageSquare, GraduationCap, Users, CreditCard,
  Clock, Sun, Moon, Sparkles, Paperclip, ChevronDown,
  ArrowUp, Loader2, User, Building2, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  type?: string;
}

const API_URL = 'http://localhost:8000';

// ── UOS Brand tokens ──────────────────────────────────────────────
const NAVY  = '#0D1B54';
const GOLD  = '#F4BA19';
const GOLD_DARK = '#e6ac10';

export default function App() {
  // Light mode is the priority/default
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('uos-theme');
    return saved === 'dark'; // default = light unless explicitly saved as dark
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('uos-auth') === 'true');
  const [email, setEmail] = useState(() => localStorage.getItem('uos-email') || '');
  const [name, setName] = useState(() => localStorage.getItem('uos-name') || '');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('uos-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    
    // Update history if it's the first message of this session
    if (messages.length === 0) {
      updateHistory(text);
    }
    
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/chat`, { message: text });
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        text: res.data.response,
        sender: 'assistant',
        type: res.data.query_type,
      }]);
    } catch {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        text: "Couldn't reach the server. Please check the backend is running.",
        sender: 'assistant',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { name: 'Admissions', icon: <Plus size={15} />, url: 'https://www.uosahiwal.edu.pk/prospectus' },
    { name: 'Departments', icon: <Building2 size={15} />, url: 'https://www.uosahiwal.edu.pk/department' },
    { name: 'Faculty',    icon: <Users size={15} />, url: 'https://www.uosahiwal.edu.pk/depart-faculty/computer-science' },
    { name: 'Fees',       icon: <CreditCard size={15} />, url: 'https://www.uosahiwal.edu.pk/depart-fee/computer-science' },
    { name: 'Timetable',  icon: <Clock size={15} />, url: `${API_URL}/api/timetable` },
  ];

  const [chatHistory, setChatHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('uos-chat-history');
    return saved ? JSON.parse(saved) : ['Admission Query', 'Fee Structure', 'Campus Info'];
  });

  const updateHistory = (newQuery: string) => {
    setChatHistory(prev => {
      if (prev.includes(newQuery)) return prev;
      const updated = [newQuery, ...prev.slice(0, 7)];
      localStorage.setItem('uos-chat-history', JSON.stringify(updated));
      return updated;
    });
  };

  const suggestions = [
    {
      badge: 'Content Help',
      badgeCls: 'bg-[#F4BA19]/15 text-[#92600A] dark:bg-[#F4BA19]/20 dark:text-[#F4BA19]',
      title: 'Create a Presentation',
      desc: 'Help me create a university course presentation.',
      prompt: 'Help me create a presentation about university courses.',
    },
    {
      badge: 'Suggestions',
      badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-[#60A5FA]',
      title: 'Brainstorm Ideas',
      desc: 'Give me extracurricular activity ideas.',
      prompt: 'Give me ideas for extracurricular activities at the university.',
    },
    {
      badge: 'Faculty',
      badgeCls: 'bg-[#F4BA19]/15 text-[#92600A] dark:bg-[#F4BA19]/20 dark:text-[#F4BA19]',
      title: 'View Faculty Members',
      desc: 'Check the official faculty directory of Computer Science.',
      url: 'https://www.uosahiwal.edu.pk/depart-faculty/computer-science',
    },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignUp ? { email, password, name } : { email, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
      setIsLoggedIn(true);
      const returnedName = res.data.name || name || email.split('@')[0];
      setName(returnedName);
      
      localStorage.setItem('uos-auth', 'true');
      localStorage.setItem('uos-email', email);
      localStorage.setItem('uos-name', returnedName);
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setName('');
    setPassword('');
    localStorage.removeItem('uos-auth');
    localStorage.removeItem('uos-email');
    localStorage.removeItem('uos-name');
  };

  const displayName = name || (email ? email.split('@')[0] : 'Student');
  const userInitials = displayName.substring(0, 2).toUpperCase();

  if (!isLoggedIn) {
    return (
      <div className={`flex h-screen w-full items-center justify-center font-sans transition-colors duration-500 ${dark ? 'bg-[#0f172a] text-[#F1F5F9]' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
        
        {/* Theme toggle for Login Screen */}
        <button
          onClick={() => setDark(!dark)}
          className={`absolute top-6 right-6 p-3 rounded-full transition-all ${dark ? 'bg-slate-800 text-[#F4BA19]' : 'bg-white shadow-md text-[#0D1B54]'}`}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${dark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex justify-center mb-8">
            <div className={`p-4 rounded-2xl ${dark ? 'bg-white' : 'bg-slate-50'}`}>
              <img src={uosLogo} alt="University of Sahiwal" className="h-20 object-contain" />
            </div>
          </div>
          
          <h2 className={`text-2xl font-black text-center uppercase tracking-tight mb-2 ${dark ? 'text-white' : 'text-[#0D1B54]'}`}>
            University AI Desk
          </h2>
          <p className={`text-sm text-center mb-6 font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isSignUp ? 'Create a new student account.' : 'Please sign in with your credentials.'}
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-[#0D1B54]/70'}`}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#F4BA19] focus:outline-none transition-all ${dark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#F4BA19]' : 'bg-slate-50 border-slate-200 text-[#0D1B54] focus:border-[#F4BA19]'}`}
                  placeholder="e.g. Adnan Shahid"
                />
              </div>
            )}
            
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-[#0D1B54]/70'}`}>
                Email / Roll Number
              </label>
              <input 
                type="text" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#F4BA19] focus:outline-none transition-all ${dark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#F4BA19]' : 'bg-slate-50 border-slate-200 text-[#0D1B54] focus:border-[#F4BA19]'}`}
                placeholder="e.g. sp21-bcs-045@uosahiwal.edu.pk"
              />
            </div>
            
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-[#0D1B54]/70'}`}>
                Password
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#F4BA19] focus:outline-none transition-all ${dark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#F4BA19]' : 'bg-slate-50 border-slate-200 text-[#0D1B54] focus:border-[#F4BA19]'}`}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#F4BA19] text-[#0D1B54] font-black uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-[#e6ac10] active:scale-95 transition-all shadow-lg shadow-[#F4BA19]/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              className={`text-xs font-bold transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#0D1B54]'}`}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200/20 text-center">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Designed by ADNAN SHAHID
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-500 ${dark ? 'bg-ambient-dark text-[#F1F5F9]' : 'bg-ambient-light text-[#0F172A]'}`}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          SIDEBAR — Deep Navy in light, darker in dark
      ════════════════════════════════════════════════════════════ */}
      <aside className={`
        ${sidebarOpen ? 'w-[272px]' : 'w-0'}
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden z-[70]
        ${dark
          ? 'bg-[#0f172a] border-r border-[#1e293b]'
          : 'bg-[#0D1B54] border-r border-[#1a2a6e]'
        }
        shadow-2xl
      `}>
        <div className="p-5 flex flex-col h-full w-[272px]">

          {/* ── Logo on white card ── */}
          <div className="mb-7">
            <div className="bg-white rounded-2xl px-3 py-2.5 flex items-center justify-center shadow-lg">
              <img
                src={uosLogo}
                alt="University of Sahiwal"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          {/* ── New Chat ── */}
          <button
            onClick={() => { setMessages([]); setSidebarOpen(false); }}
            className="flex items-center gap-3 w-full p-3.5 rounded-xl mb-7 group transition-all
              bg-[#F4BA19] hover:bg-[#e6ac10] active:scale-95 shadow-lg shadow-[#F4BA19]/20"
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={17} className="text-[#0D1B54]" />
            </div>
            <span className="font-black text-sm text-[#0D1B54] tracking-tight">New Chat</span>
          </button>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-7">

            {/* Quick Links */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.22em] mb-3 px-1 text-[#F4BA19]/70">
                Quick Links
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((l, i) => (
                  <button key={i}
                    onClick={() => l.url && window.open(l.url, '_blank')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl
                      bg-white/5 border border-white/10
                      hover:bg-[#F4BA19]/15 hover:border-[#F4BA19]/40
                      transition-all group cursor-pointer"
                  >
                    <span className="mb-1 text-white/50 group-hover:text-[#F4BA19] transition-colors">
                      {l.icon}
                    </span>
                    <span className="text-[10px] font-bold text-white/60 group-hover:text-[#F4BA19] transition-colors">
                      {l.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.22em] mb-3 px-1 text-[#F4BA19]/70">
                History
              </h3>
              <div className="space-y-0.5">
                {chatHistory.map((item, i) => (
                  <button key={i}
                    onClick={() => { setMessages([]); send(item); setSidebarOpen(false); }}
                    className="w-full text-left p-3 rounded-xl flex items-center gap-3
                      text-white/60 hover:text-white hover:bg-white/5
                      text-sm font-medium transition-all"
                  >
                    <MessageSquare size={15} className="shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="border-t border-white/10 pt-5 space-y-0.5">
              {[
                { icon: <Building2 size={16} />, label: 'About University', url: 'https://www.uosahiwal.edu.pk/introduction' },
                { icon: <Phone      size={16} />, label: 'Contact Support', url: 'mailto:info@uosahiwal.edu.pk'  },
              ].map((n, i) => (
                <button key={i}
                  onClick={() => n.url && window.open(n.url, '_blank')}
                  className="w-full text-left p-3 rounded-xl flex items-center gap-3
                    text-white/60 hover:text-white hover:bg-white/5
                    text-sm font-medium transition-all cursor-pointer"
                >
                  <span className="shrink-0">{n.icon}</span>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 pb-2 border-t border-white/10 flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-center uppercase tracking-widest text-white/30">
              © 2026 University of Sahiwal
            </p>
            <p className="text-xs font-black text-center uppercase tracking-[0.05em] text-[#F4BA19]/90 mt-1">
              Designed by ADNAN SHAHID
            </p>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* ── Header ── */}
        <header className={`h-16 shrink-0 flex items-center justify-between px-6 z-50 border-b transition-colors
          ${dark
            ? 'bg-[#0f172a]/80 backdrop-blur-md border-[#1e293b]'
            : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2.5 rounded-xl transition-all ${dark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-[#0D1B54] hover:bg-[#0D1B54]/8'}`}
            >
              <Menu size={22} />
            </button>
            <span className={`font-black text-sm uppercase tracking-tighter md:hidden ${dark ? 'text-[#F4BA19]' : 'text-[#0D1B54]'}`}>
              UOS AI
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2.5 rounded-xl transition-all active:scale-90 ${dark ? 'text-slate-400 hover:bg-slate-800 hover:text-[#F4BA19]' : 'text-[#0D1B54] hover:bg-[#0D1B54]/8'}`}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile pill */}
            <div className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border cursor-pointer transition-all shadow-sm
              ${dark
                ? 'bg-slate-800 border-slate-700 hover:border-[#F4BA19]/40'
                : 'bg-slate-100 border-slate-200 hover:border-[#0D1B54]/30'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#0D1B54] flex items-center justify-center text-[10px] font-black text-[#F4BA19]">
                {userInitials}
              </div>
              <span className={`text-sm font-bold ${dark ? 'text-slate-200' : 'text-[#0D1B54]'} capitalize`}>{displayName}</span>
              <button onClick={handleLogout} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors group">
                <ChevronDown size={14} className={dark ? 'text-slate-500 group-hover:text-red-400' : 'text-[#0D1B54]/50 group-hover:text-red-500'} />
              </button>
            </div>
          </div>
        </header>

        {/* ── Chat / Landing ── */}
        <main className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto flex flex-col min-h-full">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 flex flex-col items-center justify-center gap-12 text-center"
                >
                  {/* Greeting */}
                  <div className="space-y-3">
                    <h1 className={`text-5xl md:text-6xl font-black tracking-tighter leading-none ${dark ? 'text-white' : 'text-[#0D1B54]'}`}>
                      Hey,{' '}
                      <span style={{ color: GOLD }} className="capitalize">{displayName}</span>
                    </h1>
                    <p className={`text-3xl md:text-4xl font-black tracking-tighter leading-none ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                      What can I help with?
                    </p>
                  </div>

                  {/* Suggestion cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                    {suggestions.map((c, i) => (
                      <motion.button
                        key={i}
                        whileHover={{
                          y: -6,
                          boxShadow: dark
                            ? `0 0 0 2px ${GOLD}55, 0 20px 40px rgba(0,0,0,0.5)`
                            : `0 0 0 2px ${NAVY}30, 0 16px 32px rgba(13,27,84,0.12)`,
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => c.url ? window.open(c.url, '_blank') : send(c.prompt)}
                        className={`p-6 text-left rounded-2xl border transition-all group cursor-pointer
                          ${dark
                            ? 'bg-[#1E293B] border-slate-700 shadow-none'
                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                          }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1 rounded-full mb-4 inline-block ${c.badgeCls}`}>
                          {c.badge}
                        </span>
                        <h4 className={`font-bold text-base mb-2 transition-colors
                          ${dark
                            ? 'text-white group-hover:text-[#F4BA19]'
                            : 'text-[#0D1B54] group-hover:text-[#0D1B54]/70'
                          }`}
                        >
                          {c.title}
                        </h4>
                        <p className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {c.desc}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* Chat messages */
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 pb-4"
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
                          msg.sender === 'user'
                            ? 'bg-[#0D1B54]'
                            : dark
                              ? 'bg-[#1E293B] border border-slate-700'
                              : 'bg-white border border-slate-200'
                        }`}>
                          {msg.sender === 'user'
                            ? <User size={18} className="text-[#F4BA19]" />
                            : <GraduationCap size={18} className={dark ? 'text-[#F4BA19]' : 'text-[#0D1B54]'} />
                          }
                        </div>
                        {/* Bubble */}
                        <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-md ${
                          msg.sender === 'user'
                            ? 'bg-[#0D1B54] text-white font-semibold'
                            : dark
                              ? 'bg-[#1E293B] border border-slate-700 text-[#F1F5F9]'
                              : 'bg-white border border-slate-200 text-[#0F172A]'
                        }`}>
                          {msg.type && (
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 flex items-center gap-1">
                              <Sparkles size={9} /> {msg.type} agent
                            </p>
                          )}
                          <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert prose-p:text-white' : 'dark:prose-invert'} prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-md ${dark ? 'bg-[#1E293B] border border-slate-700' : 'bg-white border border-slate-200'}`}>
                          <GraduationCap size={18} className={dark ? 'text-[#F4BA19]' : 'text-[#0D1B54]'} />
                        </div>
                        <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-md ${dark ? 'bg-[#1E293B] border border-slate-700' : 'bg-white border border-slate-200'}`}>
                          <Loader2 size={17} className="text-[#F4BA19] animate-spin" />
                          <span className={`text-sm font-bold uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
                            Thinking…
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ── Input bar ── */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="max-w-3xl mx-auto relative group">
            {/* Glow ring on focus */}
            <div className={`absolute -inset-0.5 rounded-[22px] blur opacity-0 group-focus-within:opacity-30 transition duration-500 pointer-events-none bg-gradient-to-r ${dark ? 'from-[#1E40AF] to-[#F4BA19]' : 'from-[#0D1B54] to-[#F4BA19]'}`} />

            <div className={`relative rounded-[20px] overflow-hidden transition-all shadow-lg border
              ${dark
                ? 'bg-[#1E293B] border-slate-700 focus-within:border-[#F4BA19]/50 dark:shadow-2xl'
                : 'bg-white border-slate-300 focus-within:border-[#0D1B54] shadow-md'
              }`}
            >
              {/* Label row */}
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <Sparkles size={13} className="text-[#F4BA19]" />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-slate-400' : 'text-[#0D1B54]/60'}`}>
                  University Intelligence · v1.2
                </span>
              </div>

              {/* Textarea */}
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Ask me anything…"
                className={`w-full bg-transparent border-none focus:ring-0 outline-none p-4 resize-none text-base font-medium min-h-[56px] max-h-[180px] no-scrollbar
                  ${dark
                    ? 'text-[#F1F5F9] placeholder:text-slate-500'
                    : 'text-[#0D1B54] placeholder:text-slate-400'
                  }`}
              />

              {/* Action row */}
              <div className={`flex items-center justify-between px-3 pb-3 border-t ${dark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/80 border-slate-200'}`}>
                <button className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider
                  ${dark
                    ? 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
                    : 'text-[#0D1B54]/60 hover:bg-[#0D1B54]/8 hover:text-[#0D1B54]'
                  }`}
                >
                  <Paperclip size={17} />
                  <span className="hidden sm:inline">Attach</span>
                </button>

                {/* Send button — signature gold */}
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                    input.trim() && !loading
                      ? 'bg-[#F4BA19] text-[#0D1B54] shadow-lg shadow-[#F4BA19]/30 hover:bg-[#e6ac10] hover:scale-105 active:scale-95'
                      : dark
                        ? 'bg-slate-700 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {loading
                    ? <Loader2 size={20} className="animate-spin" />
                    : <ArrowUp size={20} strokeWidth={2.8} />
                  }
                </button>
              </div>
            </div>

            <p className={`text-[10px] text-center mt-3 font-bold uppercase tracking-widest ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
              Responses are AI-generated. Verify important info with official university offices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from "next-auth/react";

interface UserStat {
  email: string;
  count: number;
  tokens: number;
  lastActive: string;
}

interface AdminStats {
  totalUsers: number;
  totalBriefs: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: string;
  currency: string;
  dau: number;
  mau: number;
  onlineNow: number;
  users: UserStat[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok) setOpenaiKey(data.openai_api_key || '');
    } catch (e) { console.error(e); }
  };

  const saveSettings = async () => {
    setSavingKey(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openai_api_key: openaiKey })
      });
      if (res.ok) alert("Settings saved successfully!");
      else throw new Error("Failed");
    } catch (e) { alert("Failed to save settings"); }
    finally { setSavingKey(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch stats");
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#BEFF00]/20 border-t-[#BEFF00] rounded-full"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || error === "Unauthorized") {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#050505] text-white p-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 text-3xl mb-6 border border-red-500/20">
          🔒
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 text-center max-w-md mb-8">
          This area is restricted to administrators only. Please sign in with an authorized account.
        </p>
        <button 
          onClick={() => signIn()}
          className="bg-[#BEFF00] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#a5e000] transition-all"
        >
          Sign In to Access
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ECECEC] font-sans p-6 lg:p-12 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#BEFF00]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 bg-[#BEFF00] text-black rounded-xl flex items-center justify-center text-xl">A</span>
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Monitoring onlyaff.io infrastructure & costs</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchStats}
              className="px-5 py-2.5 bg-[#BEFF00]/10 text-[#BEFF00] hover:bg-[#BEFF00]/20 rounded-xl border border-[#BEFF00]/20 text-sm font-semibold transition-all flex items-center gap-2"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
               Refresh
            </button>
            <a href="/" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm font-semibold transition-all">
              Back to Dashboard
            </a>
          </div>
        </header>

        <div className="bg-[#111111]/80 border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEFF00]/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <span className="text-white">🔑</span> API Configuration
           </h2>
           <div className="flex flex-col gap-4">
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">OpenAI API Key (GPT-4o)</label>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder={openaiKey ? "••••••••••••" : "No key set (Using Vercel Env Fallback)"}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-[#BEFF00]/50 transition-all font-mono"
                    />
                    <button 
                      onClick={saveSettings}
                      disabled={savingKey}
                      className="px-8 py-3 bg-[#BEFF00] text-black font-bold rounded-xl text-sm hover:bg-[#a5e000] transition-all disabled:opacity-50 shadow-lg shadow-[#BEFF00]/10 whitespace-nowrap"
                    >
                      {savingKey ? 'Saving...' : 'Update Key'}
                    </button>
                 </div>
                 <p className="text-[10px] text-gray-500 mt-3 font-medium">This key is stored securely in the database and used for all campaign parsing operations.</p>
              </div>
           </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Total Users */}
            <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Active Users</span>
                   <span className="text-[9px] font-bold text-blue-400/70 uppercase">
                      <span className="text-emerald-400">● {stats.onlineNow} Online</span> • DAU: {stats.dau} • MAU: {stats.mau}
                   </span>
                </div>
              </div>
              <div className="text-5xl font-black text-white mb-2">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500 font-medium">Total unique accounts & guests</div>
            </div>

            {/* Token Usage */}
            <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#BEFF00]/10 rounded-2xl flex items-center justify-center text-[#BEFF00]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Token Burn</span>
              </div>
              <div className="text-5xl font-black text-white mb-2">{( (stats.promptTokens + stats.completionTokens) / 1000).toFixed(1)}k</div>
              <div className="text-sm text-gray-500 font-medium">Combined prompt & completion</div>
            </div>

            {/* Estimated Cost */}
            <div className="bg-[#111111]/80 backdrop-blur-2xl border border-[#BEFF00]/20 rounded-3xl p-8 shadow-2xl shadow-[#BEFF00]/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#BEFF00]"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#BEFF00] rounded-2xl flex items-center justify-center text-black">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <span className="text-[10px] font-bold text-[#BEFF00] uppercase tracking-widest">OpEx Estimate</span>
              </div>
              <div className="text-5xl font-black text-[#BEFF00] mb-2">${stats.estimatedCost}</div>
              <div className="text-sm text-[#BEFF00]/60 font-medium">Estimated ChatGPT (GPT-4o) cost</div>
            </div>

          </div>
        )}

        <div className="bg-[#111111]/40 border border-white/5 rounded-3xl p-8 mb-12">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <span className="text-[#BEFF00]">📈</span> User Activity
           </h2>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/5">
                   <th className="pb-4 px-2">User Email</th>
                   <th className="pb-4 px-2 text-center">Briefs</th>
                   <th className="pb-4 px-2 text-center">Tokens</th>
                   <th className="pb-4 px-2 text-right">Last Active</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {stats?.users.length === 0 && (
                   <tr>
                     <td colSpan={4} className="py-12 text-center text-gray-500 italic text-sm">
                       No user activity recorded in the database yet.
                     </td>
                   </tr>
                 )}
                 {stats?.users.map((user, i) => (
                   <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                     <td className="py-4 px-2 font-semibold text-gray-300 group-hover:text-white transition-colors">{user.email}</td>
                     <td className="py-4 px-2 text-center">
                       <span className="bg-[#BEFF00]/10 text-[#BEFF00] px-2 py-1 rounded text-xs font-bold border border-[#BEFF00]/20">
                         {user.count}
                       </span>
                     </td>
                     <td className="py-4 px-2 text-center text-gray-400 text-sm">{(user.tokens / 1000).toFixed(1)}k</td>
                     <td className="py-4 px-2 text-right text-gray-500 text-xs font-medium">
                       {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        <div className="bg-[#111111]/40 border border-white/5 rounded-3xl p-8">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <span className="text-blue-400">⚙️</span> System Infrastructure
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Total Briefs</div>
                <div className="text-2xl font-bold text-white">{stats?.totalBriefs}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Prompt Tokens</div>
                <div className="text-2xl font-bold text-white">{stats?.promptTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Completion Tokens</div>
                <div className="text-2xl font-bold text-white">{stats?.completionTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">API Status</div>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-sm font-bold text-emerald-500">HEALTHY</span>
                </div>
              </div>
           </div>
        </div>

        <div className="mt-12 text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
           Property of onlyaff.io • Security Audit Enabled
        </div>
      </div>

    </div>
  );
}

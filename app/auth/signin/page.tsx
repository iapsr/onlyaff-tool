"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [show2FA, setShow2FA] = useState(false);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("email", { email, callbackUrl: "/auth/verify-request" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        code,
        redirect: false,
        callbackUrl,
      });

      if (result?.error === "2FA_REQUIRED") {
        setShow2FA(true);
        setIsLoading(false);
        return;
      }

      if (result?.error) {
        alert("Invalid credentials or 2FA code");
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans selection:bg-[#BEFF00]/30 relative overflow-hidden">
      
      {/* Background aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#BEFF00]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/[0.02] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo */}
        <div className="flex justify-center mb-10">
           <div className="w-12 h-12 bg-[#111] border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
              <div className="w-6 h-6 bg-[#BEFF00] rounded-[6px] shadow-[0_0_20px_-5px_#BEFF00]"></div>
           </div>
        </div>

        <div className="text-center mb-8">
           <h1 className="text-2xl font-black text-white tracking-tight mb-2">
             {view === 'admin' ? 'Admin Access' : 'Sign in to onlyaff.io'}
           </h1>
           <p className="text-gray-500 text-sm font-medium">
             {view === 'admin' ? 'Secure administrative authentication' : "Don't have an account? No problem."}
           </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-[#111] p-1 rounded-xl mb-8 border border-white/5">
           <button 
             onClick={() => { setView('user'); setShow2FA(false); }}
             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'user' ? 'bg-[#BEFF00] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             User Login
           </button>
           <button 
             onClick={() => { setView('admin'); }}
             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'admin' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             Admin
           </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 text-center font-bold">
            {error === "CredentialsSignin" ? "Invalid email or password" : "Authentication failed. Please try again."}
          </div>
        )}

        <form onSubmit={view === 'admin' ? handleAdminLogin : handleUserLogin} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alan.turing@example.com"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#BEFF00]/50 transition-all placeholder:text-gray-700 font-medium"
            />
          </div>

          {view === 'admin' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#BEFF00]/50 transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
          )}

          {show2FA && (
            <div className="space-y-1.5 animate-in zoom-in duration-300">
              <label className="text-[10px] font-bold text-[#BEFF00] uppercase tracking-widest ml-1">2FA Authenticator Code</label>
              <input 
                type="text"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-[#111] border border-[#BEFF00]/40 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#BEFF00] transition-all placeholder:text-gray-700 font-mono tracking-[1em] text-center"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-2 ${view === 'admin' ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#BEFF00] text-black hover:bg-[#a5e000]'} disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            ) : (
              view === 'admin' ? 'Sign in to Admin' : 'Log In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          By signing in, you agree to our <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a> and <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>.
        </p>
      </div>

    </div>
  );
}

"use client";

import React, { useState } from 'react';

export default function LinkTester() {
  const [activeTab, setActiveTab] = useState<'link' | 'html'>('link');
  const [inputText, setInputText] = useState('');
  const [os, setOs] = useState('Android');
  const [geo, setGeo] = useState('United States');
  const [resultType, setResultType] = useState<'redirections' | 'screenshot'>('redirections');
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<{ url: string, status: number }[] | null>(null);

  const geos = [
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "India", "Brazil", "Japan", "Global"
  ];
  
  const platforms = ["Android", "iOS", "Windows", "MacOS"];

  const handleTest = () => {
    if (!inputText) return;
    setIsTesting(true);
    setResults(null);
    
    // Fake simulation of tracking redirect trace
    setTimeout(() => {
       setResults([
         { url: inputText, status: 302 },
         { url: "https://certified-tracker.affiliate.com/click?id=a9f8b2", status: 301 },
         { url: "https://measurement-partner.io/redirect/882910", status: 302 },
         { url: os === 'iOS' 
             ? "https://apps.apple.com/us/app/example/id123456789" 
             : "https://play.google.com/store/apps/details?id=com.example.app", 
           status: 200 }
       ]);
       setIsTesting(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#ECECEC] font-sans selection:bg-[#BEFF00]/30 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#BEFF00]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-[#BEFF00]/5 blur-[100px] pointer-events-none" />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 p-6 lg:p-10 w-full max-w-[1200px] mx-auto gap-8">
        
        {/* Header */}
        <header className="flex items-center justify-between shrink-0 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border border-purple-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
                Link Tester <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest hidden sm:inline-block">Pro</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Trace affiliate connections, redirects, and app store routing.</p>
            </div>
          </div>
          <div className="flex gap-4">
              <a href="/tools/url-decoder" className="text-xs font-semibold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-transparent hover:border-white/10 hidden sm:flex items-center gap-2">
                 Decoder
              </a>
              <a href="/tools/brief" className="group flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-transparent hover:border-white/10">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 Back to Briefs
              </a>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 flex flex-col bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden focus-within:border-purple-500/30 focus-within:bg-[#111111] transition-all duration-300">
          
          {/* Tabs */}
          <div className="flex px-6 pt-6 border-b border-white/5 gap-6">
             <button 
               onClick={() => setActiveTab('link')}
               className={`pb-4 text-sm font-bold tracking-wide border-b-2 transition-all ${activeTab === 'link' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
               Tracking Link
             </button>
             <button 
               onClick={() => setActiveTab('html')}
               className={`pb-4 text-sm font-bold tracking-wide border-b-2 transition-all ${activeTab === 'html' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
               HTML Tag
             </button>
          </div>

          <div className="p-6 lg:p-8 flex flex-col gap-6">
             
             {/* Input Field */}
             <div>
               <input 
                 type="text"
                 className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:bg-black/80 transition-all font-mono shadow-inner"
                 placeholder={activeTab === 'link' ? "Enter your affiliate/tracking link here..." : "Paste your HTML impression/click tag here..."}
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 disabled={isTesting}
               />
             </div>

             {/* Selectors and Submit */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                <div className="md:col-span-3 relative">
                   <select 
                     value={os}
                     onChange={(e) => setOs(e.target.value)}
                     disabled={isTesting}
                     className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-gray-300 outline-none focus:border-purple-500/50 cursor-pointer"
                   >
                     {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                   </div>
                </div>

                <div className="md:col-span-4 relative">
                   <select 
                     value={geo}
                     onChange={(e) => setGeo(e.target.value)}
                     disabled={isTesting}
                     className="w-full appearance-none bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-gray-300 outline-none focus:border-purple-500/50 cursor-pointer"
                   >
                     {geos.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                   </div>
                </div>

                <div className="md:col-span-5 flex items-center justify-end gap-6">
                   <div className="flex items-center gap-4">
                     <span className="text-xs font-semibold text-gray-500 uppercase">Show result as:</span>
                     <label className="flex items-center gap-2 cursor-pointer transition-all hover:text-white text-sm font-medium">
                       <input 
                         type="radio" 
                         name="resultType" 
                         value="redirections" 
                         checked={resultType === 'redirections'} 
                         onChange={() => setResultType('redirections')}
                         className="accent-purple-500 w-4 h-4 cursor-pointer"
                       />
                       Redirections
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer transition-all hover:text-white text-sm font-medium">
                       <input 
                         type="radio" 
                         name="resultType" 
                         value="screenshot" 
                         checked={resultType === 'screenshot'} 
                         onChange={() => setResultType('screenshot')}
                         className="accent-purple-500 w-4 h-4 cursor-pointer"
                       />
                       Screenshot
                     </label>
                   </div>
                </div>
             </div>
             
             {/* Submit Button Row */}
             <div className="flex justify-end pt-2 border-t border-white/5 mt-2">
                <button 
                  onClick={handleTest}
                  disabled={!inputText || isTesting}
                  className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-10 py-3.5 rounded-xl font-extrabold tracking-widest text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none min-w-[180px] justify-center"
                >
                  {isTesting ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                      TRACING...
                    </>
                  ) : "SUBMIT TEST"}
                </button>
             </div>

          </div>

          {/* Results Area */}
          <div className="flex-1 bg-black/40 border-t border-white/5 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative">
             {!results && !isTesting && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                   <p className="font-medium">Enter a link and hit Submit to view the redirection trace.</p>
                </div>
             )}

             {isTesting && (
                <div className="h-full flex flex-col items-center justify-center text-purple-400">
                   <span className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></span>
                   <p className="font-bold animate-pulse tracking-wider text-sm">SIMULATING OS & GEO...</p>
                </div>
             )}

             {results && !isTesting && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                     Redirection Path
                   </h3>
                   <div className="space-y-4 relative">
                     {/* Connecting Line */}
                     <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-white/10" />
                     
                     {results.map((r, idx) => (
                       <div key={idx} className="flex gap-6 relative z-10">
                          <div className="flex flex-col items-center gap-2">
                             <div className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center text-xs font-black shadow-lg border ${
                               r.status === 200 
                                 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                 : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                             }`}>
                               {r.status}
                             </div>
                          </div>
                          <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-4 break-all font-mono text-sm my-auto">
                             <span className={idx === 0 ? 'text-gray-400' : idx === results.length - 1 ? 'text-emerald-300 font-bold' : 'text-gray-200'}>
                               {r.url}
                             </span>
                          </div>
                       </div>
                     ))}
                   </div>
                   
                   {resultType === 'screenshot' && (
                     <div className="mt-8 border-t border-white/5 pt-8">
                       <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Final App/Store Screenshot</h3>
                       <div className="w-full max-w-sm border-4 border-gray-800 rounded-[2rem] overflow-hidden bg-black aspect-[9/19] flex items-center justify-center relative shadow-2xl mx-auto">
                          <div className="absolute top-2 w-16 h-4 bg-gray-800 rounded-full"></div>
                          <p className="text-xs text-gray-600 font-bold">Screenshot Simulation Placeholder</p>
                       </div>
                     </div>
                   )}
                </div>
             )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { border-radius: 10px; background: rgba(255, 255, 255, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}} />
    </div>
  );
}

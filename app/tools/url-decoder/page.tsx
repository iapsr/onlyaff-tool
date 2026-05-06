"use client";

import React, { useState, useMemo } from 'react';

export default function UrlDecoder() {
  const [inputText, setInputText] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  const decodedData = useMemo(() => {
    if (!inputText) return { full: '', baseUrl: '', params: [] };
    
    try {
      // Decode recursively up to 3 times to handle double-encoded URLs
      let decoded = inputText;
      for (let i = 0; i < 3; i++) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
      
      let params: { key: string, value: string }[] = [];
      let baseUrl = decoded;

      // Extract query parameters manually to handle strings that aren't full URLs
      const qIndex = decoded.indexOf('?');
      if (qIndex !== -1) {
        baseUrl = decoded.substring(0, qIndex);
        const query = decoded.substring(qIndex + 1);
        const searchParams = new URLSearchParams(query);
        params = Array.from(searchParams.entries()).map(([key, value]) => ({ key, value }));
      }

      return { full: decoded, baseUrl, params };
    } catch (e) {
      return { full: 'Error: Invalid encoded string.', baseUrl: '', params: [] };
    }
  }, [inputText]);

  const handleCopy = () => {
    if (decodedData.full) {
      navigator.clipboard.writeText(decodedData.full);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#ECECEC] font-sans selection:bg-[#BEFF00]/30 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#BEFF00]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-[#BEFF00]/5 blur-[100px] pointer-events-none" />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 p-6 lg:p-10 w-full max-w-[1400px] mx-auto gap-8">
        
        {/* Header */}
        <header className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#BEFF00] text-black rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#BEFF00]/20 border border-[#BEFF00]/40">
              d
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Deep URL Decoder</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Parse, cleanly decode, and analyze tracking links.</p>
            </div>
          </div>
          <div className="flex gap-4">
              <a href="/tools/link-tester" className="text-xs font-semibold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-transparent hover:border-white/10 hidden sm:flex items-center gap-2">
                 Link Tester
              </a>
              <a href="/tools/brief" className="group flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-transparent hover:border-white/10">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 Back to Briefs
              </a>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden min-h-0">
          
          {/* Left: Input */}
          <div className="flex flex-col bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden focus-within:border-[#BEFF00]/40 focus-within:bg-[#111111] transition-all duration-300">
            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
              <span className="text-[#BEFF00] drop-shadow-[0_0_8px_rgba(190,255,0,0.5)]">🔗</span>
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Encoded Input</h2>
            </div>
            <textarea
              className="flex-1 w-full bg-transparent resize-none outline-none p-6 text-gray-300 placeholder-gray-600 custom-scrollbar text-sm leading-loose font-mono"
              placeholder="Paste your raw, URL-encoded string here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              spellCheck={false}
            />
            {inputText && (
              <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setInputText('')}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  Clear Input
                </button>
              </div>
            )}
          </div>

          {/* Right: Output & Params */}
          <div className="flex flex-col bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
             <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">✨</span>
                 <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Decoded Output</h2>
              </div>
              <button 
                  onClick={handleCopy}
                  disabled={!decodedData.full || decodedData.full.startsWith('Error')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-[#BEFF00]/20 hover:border-[#BEFF00]/50 hover:text-[#BEFF00] px-3 py-1.5 rounded-lg border border-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
               >
                  {copyStatus ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      Copy Clean URL
                    </>
                  )}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
              {!inputText ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 h-full min-h-[300px]">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                   </div>
                   <p className="font-semibold text-sm">Awaiting Input</p>
                   <p className="text-xs mt-1 opacity-70">Paste a link on the left to see the magic.</p>
                </div>
              ) : decodedData.full.startsWith('Error') ? (
                 <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-mono">
                    {decodedData.full}
                 </div>
              ) : (
                <>
                  {/* Full Decoded String */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Base URL</h3>
                    <div className="bg-black/50 border border-white/10 rounded-xl p-4 break-all text-sm font-mono text-[#BEFF00]">
                      {decodedData.baseUrl || decodedData.full}
                    </div>
                  </div>

                  {/* Query Parameters Table */}
                  {decodedData.params.length > 0 && (
                    <div className="flex-1 pb-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        Query Parameters
                        <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-[10px]">{decodedData.params.length} found</span>
                      </h3>
                      <div className="border border-white/10 rounded-xl overflow-hidden bg-black/30">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                              <th className="p-3 font-semibold border-b border-white/5 w-1/3">Key</th>
                              <th className="p-3 font-semibold border-b border-white/5 w-2/3">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                            {decodedData.params.map((p, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-3 text-indigo-300 break-all select-all align-top text-xs font-bold">{p.key}</td>
                                <td className="p-3 text-gray-300 break-all select-all text-xs">{p.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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

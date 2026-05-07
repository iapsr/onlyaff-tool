"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

type ParsedData = {
  campaign_name?: string;
  geo?: string;
  mmp?: string;
  model?: string;
  preview_links?: { android?: string; ios?: string };
  payable_event?: string;
  payout?: string | string[];
  kpis?: string[];
  validation_rules?: string[];
  feedback?: string[];
  notes?: string[];
  tracking_link?: string;
  af_prt?: string;
};

type CampaignHistoryItem = {
  id: string;
  name: string;
  timestamp: number;
  inputText: string;
  formattedText: string;
};

interface TeamsContact {
  id: string;
  name: string;
  teams: string; // The email/UPN used for Teams chat
}

const generateFormattedText = (data: ParsedData): string => {
  let text = '';

  if (data.campaign_name) text += `Campaign: ${data.campaign_name}\n`;
  if (data.geo) text += `Geo: ${data.geo}\n`;
  if (data.mmp) text += `MMP: ${data.mmp}\n`;
  if (data.model) text += `Model: ${data.model}\n`;
  if (data.payable_event) text += `Payable Event: ${data.payable_event}\n`;
  
  if (data.payout) {
    if (Array.isArray(data.payout)) {
      text += `Payout Tiers:\n`;
      data.payout.forEach(p => text += `- ${p}\n`);
    } else if (data.payout.includes('\n')) {
      text += `Payout:\n${data.payout}\n`;
    } else {
      text += `Payout: ${data.payout}\n`;
    }
  }
  
  if (data.campaign_name || data.geo || data.mmp || data.model || data.payable_event || data.payout) {
    text += `\n`;
  }

  if (data.preview_links?.android || data.preview_links?.ios) {
    text += `Preview Links:\n`;
    if (data.preview_links.android) text += `- Android: ${data.preview_links.android}\n`;
    if (data.preview_links.ios) text += `- iOS: ${data.preview_links.ios}\n`;
    text += `\n`;
  }

  if (data.kpis && data.kpis.length > 0) {
    text += `KPIs:\n`;
    data.kpis.forEach(kpi => text += `- ${kpi}\n`);
    text += `\n`;
  }

  if (data.validation_rules && data.validation_rules.length > 0) {
    text += `Validation Rules:\n`;
    data.validation_rules.forEach(rule => text += `- ${rule}\n`);
    text += `\n`;
  }

  if (data.feedback && data.feedback.length > 0) {
    text += `Feedback:\n`;
    data.feedback.forEach(fb => text += `- ${fb}\n`);
    text += `\n`;
  }

  if (data.notes && data.notes.length > 0) {
    text += `Notes:\n`;
    data.notes.forEach(note => text += `- ${note}\n`);
    text += `\n`;
  }

  return text.trim() + '\n';
};

export default function CampaignBriefBuilder() {
  const { data: session } = useSession();
  
  const [inputText, setInputText] = useState('');
  const [formattedOutput, setFormattedOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [validationWarning, setValidationWarning] = useState<{
    isOpen: boolean;
    missingFields: string[];
    pendingData: ParsedData | null;
  }>({ isOpen: false, missingFields: [], pendingData: null });

  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [usage, setUsage] = useState({ count: 0, limit: 3 });

  // Fetch usage on mount and after generation
  const fetchUsage = async () => {
    if (session && (session.user as any).provider === 'linkedin') {
      try {
        const res = await fetch('/api/usage');
        const data = await res.json();
        setUsage(data);
      } catch (e) {
        console.error("Failed to fetch usage", e);
      }
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [session]);

  // Teams Hub Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [contacts, setContacts] = useState<TeamsContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("Hi {Name},\n\nPlease review the campaign implementation details below:\n\n{Brief}");
  
  const [sendingTeamsIds, setSendingTeamsIds] = useState<Set<string>>(new Set());
  const [selectedPubIds, setSelectedPubIds] = useState<Set<string>>(new Set());
  const [isBulkSending, setIsBulkSending] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('campaignHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Fetch Microsoft Contacts automatically when modal opens and session exists
  useEffect(() => {
    if (session && isShareModalOpen && contacts.length === 0) {
      const fetchTeamsContacts = async () => {
         setLoadingContacts(true);
         setContactsError("");
         try {
            const res = await fetch("/api/teams/contacts");
            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error);
            setContacts(data.contacts);
            // Default select all contacts
            setSelectedPubIds(new Set(data.contacts.map((c: any) => c.id)));
         } catch (err: any) {
            setContactsError(err.message);
         } finally {
            setLoadingContacts(false);
         }
      };
      fetchTeamsContacts();
    }
  }, [session, isShareModalOpen, contacts.length]);

  const saveToHistory = (input: string, data: ParsedData, formattedText: string) => {
    const newItem: CampaignHistoryItem = {
      id: Date.now().toString(),
      name: data.campaign_name || 'Unnamed Campaign',
      timestamp: Date.now(),
      inputText: input,
      formattedText: formattedText
    };
    
    setHistory(prev => {
      const newHistory = [newItem, ...prev].slice(0, 50);
      localStorage.setItem('campaignHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const generateBrief = async () => {
    if (!inputText.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/parse-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.details ? `[${data.error}] ${data.details}` : (data.error || 'Failed to fetch from API'));
      }

      // ----------------------------------------------------------------------
      // NEW: Validation Check before formatting
      // ----------------------------------------------------------------------
      const missingFields = [];
      if (!data.preview_links || (!data.preview_links.android && !data.preview_links.ios)) missingFields.push("Preview Link");
      if (!data.geo) missingFields.push("Geo (Target Location)");
      if (!data.mmp) missingFields.push("MMP (Mobile Measurement Partner)");
      if (!data.validation_rules || data.validation_rules.length === 0) missingFields.push("Validation Rules");
      if (!data.payout) missingFields.push("Payout Amount");
      if (!data.payable_event) missingFields.push("Payable Event / Action");

      if (missingFields.length > 0) {
        setValidationWarning({
           isOpen: true,
           missingFields,
           pendingData: data
        });
        return; // Pause execution, open modal
      }

      const formatted = generateFormattedText(data);
      setFormattedOutput(formatted);
      saveToHistory(inputText, data, formatted);
      fetchUsage(); // Refresh usage after success
    } catch (error: any) {
      console.error('Error generating brief:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (formattedOutput) {
      navigator.clipboard.writeText(formattedOutput);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleNew = () => {
    setFormattedOutput('');
    setInputText('');
  };

  const loadHistoryItem = (item: CampaignHistoryItem) => {
    setInputText(item.inputText);
    setFormattedOutput(item.formattedText);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => {
      const newHistory = prev.filter(h => h.id !== id);
      localStorage.setItem('campaignHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const getPopulatedMessage = (name: string) => {
    let dynamicMsg = messageTemplate.replace(/{Name}/g, name || 'Team Member');
    dynamicMsg = dynamicMsg.replace(/{Brief}/g, formattedOutput);
    return dynamicMsg;
  };
  
  const shareViaTeamsDeepLink = (contact: TeamsContact) => {
    const message = encodeURIComponent(getPopulatedMessage(contact.name));
    window.open(`https://teams.microsoft.com/l/chat/0/0?users=${contact.teams}&message=${message}`);
  };

  const shareViaTeamsAPI = (contact: TeamsContact) => {
    // Azure AD removed, fallback to deep link
    shareViaTeamsDeepLink(contact);
  };

  const bulkSendTeamsDeepLink = () => {
    const targets = contacts.filter(c => selectedPubIds.has(c.id) && c.teams);
    if (targets.length === 0) {
       alert("No contacts selected.");
       return;
    }
    
    alert(`Opening ${targets.length} Teams chat tabs...`);
    targets.forEach(contact => shareViaTeamsDeepLink(contact));
  };

  const toggleAllContacts = () => {
    if (selectedPubIds.size === contacts.length) {
      setSelectedPubIds(new Set());
    } else {
      setSelectedPubIds(new Set(contacts.map(c => c.id)));
    }
  };

  const toggleContact = (id: string) => {
    setSelectedPubIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#ECECEC] font-sans selection:bg-[#BEFF00]/30 overflow-hidden relative">
      
      {/* Growven Glassmorphism Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#BEFF00]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-[#BEFF00]/5 blur-[100px] pointer-events-none" />

      {/* Dynamic Sidebar (Glass) */}
      <div className={`fixed lg:relative ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:translate-x-0'} w-[280px] h-full bg-[#111111]/95 lg:bg-[#111111]/80 backdrop-blur-3xl border-r border-[#BEFF00]/10 flex flex-col transition-all duration-300 overflow-hidden z-30 shadow-2xl`}>
         <div className="p-5 border-b border-white/5 flex items-center gap-3 shrink-0 h-[72px]">
            <div className="w-8 h-8 bg-[#BEFF00] text-black rounded-lg flex items-center justify-center font-black text-lg shadow-lg shadow-[#BEFF00]/20 shrink-0 border border-[#BEFF00]/40">
              o
            </div>
            <div className="font-bold tracking-widest text-base truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              onlyaff<span className="text-[#BEFF00]">.</span>io
            </div>
         </div>
         
         <div className="p-4 shrink-0">
           <button 
             onClick={handleNew}
             className="w-full text-sm font-semibold text-white bg-white/5 hover:bg-white/10 hover:text-[#BEFF00] py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 shadow-lg backdrop-blur-md"
           >
             <span>✨</span> New Brief
           </button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 opacity-20 pointer-events-none select-none">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">History Logs</div>
            <div className="text-center p-8 border border-white/5 rounded-xl bg-white/5">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">History Disabled</p>
            </div>
         </div>

         {/* Other Tools Navigation */}
         <div className="p-4 shrink-0 border-t border-white/5 bg-black/20 backdrop-blur-md">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Other Tools</div>
            <a 
              href="/tools/url-decoder"
              className="group flex items-center gap-3 w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10 mb-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[#BEFF00]/10 text-[#BEFF00] flex items-center justify-center font-black text-sm group-hover:bg-[#BEFF00] group-hover:text-black transition-all shadow-inner">
                d
              </div>
              <div className="flex-1 text-left">
                 <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Deep URL Decoder</div>
                 <div className="text-[10px] text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">Parse tracking links</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
            
            <a 
              href="/tools/link-tester"
              className="group flex items-center gap-3 w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-purple-500/30"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-sm group-hover:bg-purple-500 group-hover:text-white transition-all shadow-inner">
                t
              </div>
              <div className="flex-1 text-left">
                 <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Link Tester Pro</div>
                 <div className="text-[10px] text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors">Trace OS & Geo routing</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>

            {/* Admin Panel Link (Conditional) */}
            {session?.user?.email && (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').includes(session.user.email) && (
              <a 
                href="/admin"
                className="group flex items-center gap-3 w-full p-3 bg-[#BEFF00]/5 hover:bg-[#BEFF00]/10 rounded-xl transition-all border border-[#BEFF00]/10 hover:border-[#BEFF00]/30 mt-4 shadow-lg shadow-[#BEFF00]/5"
              >
                <div className="w-8 h-8 rounded-lg bg-[#BEFF00] text-black flex items-center justify-center font-black text-xs shadow-inner">
                  ADM
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-[#BEFF00]">Admin Panel</div>
                  <div className="text-[10px] text-[#BEFF00]/60 mt-0.5">Stats & Cost Tracking</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#BEFF00] group-hover:translate-x-1 transition-all"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            )}
         </div>
      </div>

      {/* Main App Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Header (Glass) */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#111111]/60 backdrop-blur-xl border-b border-white/5 shrink-0 h-[72px]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-[#BEFF00] hover:bg-[#BEFF00]/10 rounded-lg transition-all"
              title="Toggle History"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="text-sm text-gray-200 font-semibold tracking-wide hidden sm:block">
              Campaign Brief Formatter
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session && (session.user as any).provider === 'linkedin' && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">LinkedIn Quota:</span>
                <span className="text-sm font-bold text-white">{usage.count} / {usage.limit}</span>
              </div>
            )}

            {/* Auth Disabled */}
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Tool Preview Mode</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Powered By</span>
               <span className="text-sm font-black text-[#BEFF00] tracking-wide">Growven</span>
            </div>
          </div>
        </header>

        {/* Main Grid: 60% Left, 40% Right */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-10 overflow-hidden w-full max-w-[1600px] mx-auto p-4 lg:p-8 gap-6 lg:gap-8 relative">
          
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 z-[40] backdrop-blur-[12px] bg-black/40 flex items-center justify-center p-6">
             <div className="text-center p-12 rounded-[40px] border border-[#BEFF00]/20 bg-[#050505]/80 shadow-[0_0_80px_-20px_rgba(190,255,0,0.25)] backdrop-blur-2xl max-w-sm w-full animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-[#BEFF00]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#BEFF00]/20">
                   <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">COMING SOON</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">We are fine-tuning this tool to ensure a premium experience. Access will be enabled shortly.</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-[#BEFF00] w-1/3 animate-[progress_2s_infinite_linear]" style={{backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'}}></div>
                </div>
                <p className="text-[10px] font-bold text-[#BEFF00] uppercase tracking-[0.2em] mt-4 opacity-50">Under Construction</p>
             </div>
          </div>
          
          {/* Mobile Overlay for Sidebar */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Left 60%: Input Area (Glass) */}
          <div className="lg:col-span-6 flex flex-col h-full overflow-hidden bg-[#161616]/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl focus-within:border-[#BEFF00]/40 focus-within:bg-[#161616]/80 transition-all duration-300">
            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
              <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <span className="text-[#BEFF00]">💬</span> Raw Implementation Instructions
              </h2>
            </div>
            
            <textarea
              className="flex-1 w-full bg-transparent resize-none outline-none p-6 text-gray-100 placeholder-gray-600 custom-scrollbar text-base leading-relaxed"
              placeholder="Paste or type campaign details here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
            />
            
            <div className="p-5 flex justify-end gap-4 border-t border-white/5 items-center bg-black/40">
              <span className="text-xs text-gray-500 ml-2 hidden sm:block">
                AI Formatter can make mistakes. Please verify important KPIs.
              </span>
              
              <button 
                onClick={generateBrief}
                disabled={!inputText.trim() || isGenerating}
                className="bg-[#BEFF00] hover:bg-[#a5e000] text-black ml-auto px-8 py-3 rounded-xl font-extrabold text-sm shadow-lg shadow-[#BEFF00]/20 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none border border-[#BEFF00]/50"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-black/40 border-t-black rounded-full"></span>
                    Formatting...
                  </>
                ) : (
                  <>
                    <span>✨</span> Format Document
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right 40%: Output Area (Glass) */}
          <div className="lg:col-span-4 h-full flex flex-col overflow-hidden bg-[#161616]/60 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="text-[#BEFF00]">📄</span> Output Document
              </h2>
              
              <div className="flex items-center gap-2">

                 <button 
                    onClick={handleCopy}
                    disabled={!formattedOutput}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-[#BEFF00]/20 hover:border-[#BEFF00]/50 hover:text-[#BEFF00] px-4 py-2 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-gray-300 disabled:hover:border-white/10"
                 >
                    {isCopied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#BEFF00]"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span className="text-[#BEFF00]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy Brief</span>
                      </>
                    )}
                 </button>
              </div>
            </div>

            <div className="flex-1 bg-white/95 text-gray-900 overflow-hidden flex flex-col relative">
               {!formattedOutput ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                   <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                   </div>
                   <p className="font-semibold text-gray-600 mb-1">No Output Yet</p>
                   <p className="text-sm">Click "Format Document" to generate.</p>
                 </div>
               ) : (
                 <textarea
                   className="flex-1 w-full bg-transparent resize-none outline-none px-8 py-6 text-[13px] text-gray-800 custom-scrollbar-light font-sans leading-relaxed"
                   value={formattedOutput}
                   onChange={(e) => setFormattedOutput(e.target.value)}
                 />
               )}

               {formattedOutput && (
                  <div className="p-4 border-t border-white/10 bg-[#161616]/80 flex justify-center backdrop-blur-md relative z-20 shrink-0">
                     <button 
                       onClick={() => {
                         // Copy to clipboard explicitly as MS Teams Desktop is notorious for dropping deep link payloads
                         handleCopy();
                         const message = encodeURIComponent(formattedOutput);
                         window.location.assign(`msteams://teams.microsoft.com/share?msgText=${message}`);
                       }}
                       className="w-full flex items-center justify-center gap-2 text-sm font-extrabold text-white bg-[#5B5FC7] hover:bg-[#464EB8] px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-[#5B5FC7]/20 border border-transparent hover:border-white/20 active:scale-[0.98]"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                       Quick Share via MS Teams
                     </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Teams Hub Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                      <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </span> 
                      Microsoft Teams Hub
                  </h2>
                  <button onClick={() => setIsShareModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">Close</button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                  
                  {/* Auth Status Banner */}
                  <div className="flex items-center justify-between bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl shadow-lg">
                      <div className="text-sm text-indigo-300 flex items-center gap-2">
                        <span>Direct Microsoft Graph Connection Active</span>
                      </div>
                      {!session ? (
                         <button onClick={() => signIn("azure-ad")} className="text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                           Sign in to Microsoft
                         </button>
                      ) : (
                         <div className="flex items-center gap-4">
                           <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30">Authenticated</span>
                           <button onClick={() => signOut()} className="text-[10px] font-semibold text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 px-2 py-1 rounded transition-all">
                             Sign Out & Reset
                           </button>
                         </div>
                      )}
                  </div>

                  {/* Empty State / Not logged in */}
                  {!session && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 py-16 text-center flex flex-col items-center justify-center">
                        <div className="text-5xl mb-5 opacity-80">🔐</div>
                        <h3 className="text-white font-bold text-xl mb-2">Connect Your Team Directory</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-lg leading-relaxed">
                          Securely sign in with your MS Teams (Azure AD) account to automatically load and message your colleagues directly from this tool without leaving the page.
                        </p>
                        <button onClick={() => signIn("azure-ad")} className="bg-white text-black px-8 py-3 rounded-xl font-extrabold shadow-lg hover:bg-gray-200 transition-all text-sm">Sign in securely via SSO</button>
                    </div>
                  )}

                  {session && loadingContacts && (
                    <div className="flex flex-col items-center justify-center p-16 text-indigo-400 gap-4">
                      <span className="animate-spin w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"></span>
                      <span className="font-semibold text-sm animate-pulse">Fetching Organization Contacts...</span>
                    </div>
                  )}

                  {session && contactsError && !loadingContacts && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
                       <h3 className="font-bold mb-2">Failed to load contacts</h3>
                       <p className="text-sm opacity-80">{contactsError}</p>
                       <p className="text-xs mt-4">Make sure you have updated your Azure Portal permissions to include <b>User.ReadBasic.All</b> and re-authenticated.</p>
                       <button onClick={() => signIn("azure-ad")} className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/40 border border-red-500/50">Re-Authenticate</button>
                    </div>
                  )}

                  {/* Editable Preview Template & List of Contacts */}
                  {session && !loadingContacts && !contactsError && contacts.length > 0 && (
                      <div className="flex flex-col gap-6">
                        
                        {/* Custom Template Editor */}
                        <div className="bg-black/30 p-5 rounded-2xl border border-white/10 shadow-inner">
                           <div className="flex justify-between items-center mb-3">
                             <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                               Message Template Preview
                             </label>
                           </div>
                           <textarea 
                             className="w-full bg-black/60 border border-white/10 hover:border-white/20 transition-all rounded-xl p-4 text-sm text-gray-200 custom-scrollbar-light focus:border-indigo-500/50 outline-none leading-relaxed"
                             rows={4}
                             value={messageTemplate}
                             onChange={(e) => setMessageTemplate(e.target.value)}
                           />
                           <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
                             <span className="font-semibold">Dynamic Variables:</span>
                             <code className="text-indigo-400 font-mono tracking-tight px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/30">{`{Name}`}</code>
                             <code className="text-indigo-400 font-mono tracking-tight px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/30">{`{Brief}`}</code>
                           </div>
                        </div>

                        <div className="space-y-4">
                          
                          {/* Bulk Actions Bar */}
                          <div className="flex items-center justify-between p-3 bg-[#111] border border-white/10 rounded-xl mt-2 mb-2 sticky top-0 z-10 shadow-lg">
                             <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={selectedPubIds.size === contacts.length && contacts.length > 0}
                                  onChange={toggleAllContacts}
                                  className="w-4 h-4 rounded border-white/20 bg-black/50 accent-indigo-500 cursor-pointer"
                                />
                                <span className="text-sm font-semibold text-gray-200">
                                  Select All ({selectedPubIds.size}/{contacts.length})
                                </span>
                             </label>
                             
                             <button
                               onClick={bulkSendTeamsDeepLink}
                               disabled={isBulkSending || selectedPubIds.size === 0}
                               className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg ${
                                 isBulkSending || selectedPubIds.size === 0
                                  ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 hover:scale-[1.03] transform'
                               }`}
                             >
                               {isBulkSending ? (
                                  <>
                                    <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"></span>
                                    <span>Sending Batch...</span>
                                  </>
                               ) : (
                                  <>
                                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                     <span>Broadcast via Teams</span>
                                  </>
                               )}
                             </button>
                          </div>
                          
                          {/* Partners Map */}
                          <div className="space-y-2 pb-4">
                            {contacts.map((contact, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all shadow-md ${
                                    selectedPubIds.has(contact.id) 
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.05]' 
                                      : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                      <input 
                                        type="checkbox"
                                        checked={selectedPubIds.has(contact.id)}
                                        onChange={() => toggleContact(contact.id)}
                                        className="w-4 h-4 rounded border-white/20 bg-black/50 accent-indigo-500 cursor-pointer"
                                      />
                                      <div className="flex flex-col">
                                          <span className={`font-semibold text-sm ${selectedPubIds.has(contact.id) ? 'text-white' : 'text-gray-300'}`}>{contact.name}</span>
                                          <span className="text-gray-400 text-xs flex gap-5 mt-1.5 font-medium">
                                            {contact.teams && <span className="flex items-center gap-1.5"><span className="text-indigo-400 opacity-80">MS</span> {contact.teams}</span>}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => shareViaTeamsAPI(contact)} 
                                        disabled={sendingTeamsIds.has(contact.id)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 shadow-lg ${
                                          sendingTeamsIds.has(contact.id) 
                                            ? 'bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed'
                                            : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border-indigo-500/20'
                                        }`}
                                      >
                                        {sendingTeamsIds.has(contact.id) ? (
                                           <span className="animate-spin w-3 h-3 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full"></span>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        )}
                                        <span>Direct Message</span>
                                      </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>

                      </div>
                  )}
                </div>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar,
        .custom-scrollbar-light::-webkit-scrollbar { width: 6px; }
        
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { border-radius: 10px; background: rgba(255, 255, 255, 0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }

        .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { border-radius: 10px; background: rgba(0, 0, 0, 0.2); }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.4); }
      `}} />
      
      {/* Validation Warning Web Native Modal */}
      {validationWarning.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="bg-[#111] border border-red-500/30 rounded-3xl shadow-[0_0_60px_-15px_rgba(239,68,68,0.3)] w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
              <div className="p-6 border-b border-red-500/10 flex items-center gap-4 bg-red-500/5">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl shrink-0 border border-red-500/30">
                  ⚠️
                </div>
                <div>
                   <h2 className="text-lg font-bold text-white tracking-wide">Missing Campaign Details</h2>
                   <p className="text-xs text-red-400 mt-1">The AI could not extract the following required fields:</p>
                </div>
              </div>
              <div className="p-6 bg-[#0a0a0a]">
                 <ul className="space-y-3 mb-8">
                   {validationWarning.missingFields.map((field, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-300 bg-[#161616] p-4 rounded-xl border border-white/5 shadow-inner">
                       <span className="text-red-500 text-lg">❌</span> {field}
                     </li>
                   ))}
                 </ul>
                 <p className="text-sm text-gray-400 text-center mb-6 px-4">Are you absolutely sure you want to generate the brief missing this critical information?</p>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setValidationWarning({ isOpen: false, missingFields: [], pendingData: null })}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98]"
                    >
                      Cancel & Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (validationWarning.pendingData) {
                          const formatted = generateFormattedText(validationWarning.pendingData);
                          setFormattedOutput(formatted);
                          saveToHistory(inputText, validationWarning.pendingData, formatted);
                        }
                        setValidationWarning({ isOpen: false, missingFields: [], pendingData: null });
                      }}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
                    >
                      Generate Anyway
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="mt-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 w-full max-w-[1600px] mx-auto shrink-0 relative z-10">
         <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">© 2024 onlyaff.io • All Rights Reserved</p>
         <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-bold text-gray-500 hover:text-[#BEFF00] uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] font-bold text-gray-500 hover:text-[#BEFF00] uppercase tracking-widest transition-colors">Terms of Use</a>
         </div>
      </footer>

    </div>
  );
}

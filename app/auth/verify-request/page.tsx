"use client";

export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#BEFF00]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[400px] text-center relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight mb-4">Check your email</h1>
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 px-4">
          A secure verification link has been sent to your email address. Please click the link to sign in.
        </p>

        <a 
          href="/auth/signin" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-xs rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
        >
          Go to login
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    </div>
  );
}

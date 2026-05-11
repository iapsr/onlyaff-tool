import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-24 font-sans selection:bg-[#BEFF00]/30">
      <div className="max-w-3xl mx-auto">
        <a href="/auth/signin" className="text-[#BEFF00] text-sm font-bold uppercase tracking-widest mb-12 inline-block hover:opacity-70 transition-opacity">← Back to Sign In</a>
        
        <h1 className="text-5xl font-black mb-12 tracking-tighter">Terms of Service</h1>
        
        <div className="space-y-12 text-gray-400 leading-relaxed text-lg">
          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
            <p>By accessing or using OnlyAff, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">2. Description of Service</h2>
            <p>OnlyAff provides AI-powered tools for affiliate marketing campaign analysis and brief generation. We reserve the right to modify or discontinue services at any time.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">3. User Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your unique User ID. You agree to use the service only for lawful purposes.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">4. Data Usage</h2>
            <p>Our service processes data through third-party AI models (OpenAI). By using OnlyAff, you acknowledge that your inputs will be processed to generate results. We do not sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">5. Limitations of Liability</h2>
            <p>OnlyAff is provided "as is". We are not liable for any direct or indirect damages resulting from your use of the service or any AI-generated content.</p>
          </section>

          <footer className="pt-12 border-t border-white/5 text-sm text-gray-600 font-medium">
            Last Updated: May 2026 • © 2026 OnlyAff.io
          </footer>
        </div>
      </div>
    </div>
  );
}

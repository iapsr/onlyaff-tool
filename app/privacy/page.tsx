import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-24 font-sans selection:bg-[#BEFF00]/30">
      <div className="max-w-3xl mx-auto">
        <a href="/auth/signin" className="text-[#BEFF00] text-sm font-bold uppercase tracking-widest mb-12 inline-block hover:opacity-70 transition-opacity">← Back to Sign In</a>
        
        <h1 className="text-5xl font-black mb-12 tracking-tighter">Privacy Policy</h1>
        
        <div className="space-y-12 text-gray-400 leading-relaxed text-lg">
          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">1. Data Collection</h2>
            <p>We collect minimal personal information necessary to provide our services, including your email address and an optional phone number. Every user is assigned a unique, non-identifiable 6-character User ID.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">2. Use of Information</h2>
            <p>Your email is used exclusively for authentication via passwordless magic links. We do not use your contact information for marketing purposes unless you explicitly opt-in.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">3. AI Processing</h2>
            <p>Inputs provided to our campaign analysis tools are processed using OpenAI's API. This data is used only to generate your specific results and is governed by OpenAI's data privacy policies.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">4. Security</h2>
            <p>We implement industry-standard security measures to protect your data. Admin access is strictly secured via Multi-Factor Authentication (MFA) and encrypted credentials.</p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-wider">5. Third-Party Services</h2>
            <p>We use Resend for email delivery and Prisma/Supabase for database management. These partners are selected for their commitment to high security and privacy standards.</p>
          </section>

          <footer className="pt-12 border-t border-white/5 text-sm text-gray-600 font-medium">
            Last Updated: May 2026 • © 2026 OnlyAff.io
          </footer>
        </div>
      </div>
    </div>
  );
}

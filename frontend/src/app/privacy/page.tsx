import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - PlannerTravel',
  description: 'Privacy Policy and Cookie Disclosures for PlannerTravel AI.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparency & Data Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: September 30, 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you use PlannerTravel (PlannerTravel.in), we collect information to provide intelligent AI travel planning services. This includes user account details (name, email), trip preferences (budget, travel style, dietary preferences), and anonymous usage analytics.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>2. Google AdSense & Third-Party Cookies</span>
          </h2>
          <p>
            We use third-party advertising companies, including Google AdSense, to serve ads when you visit our website. Google uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to our website or other websites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 underline hover:text-teal-300"
            >
              Google Ads Settings
            </a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>3. Affiliate Marketing Disclosure</span>
          </h2>
          <p>
            PlannerTravel participates in travel affiliate programs (including Booking.com, Agoda, GetYourGuide, Viator, and Travelpayouts). Some links on this site are affiliate links, meaning that if you click on the link and make a purchase or booking, we may receive an affiliate commission at no extra cost to you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Data Security</h2>
          <p>
            We implement strict industry-standard security measures including encrypted transmission, JWT authentication, and isolated database storage to protect your personal information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, please contact us at{' '}
            <span className="text-teal-300 font-mono">support@plannertravel.in</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

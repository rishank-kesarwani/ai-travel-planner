import React from 'react';
import { FileCheck, Shield, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - TravelPlanner AI',
  description: 'Terms of Service for TravelPlanner AI.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
      <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/30">
          <FileCheck className="w-3.5 h-3.5" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: September 30, 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using TravelPlanner AI (travel-planner.rishankkesarwani.com), you accept and agree to be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. AI Generated Itineraries & Recommendations</h2>
          <p>
            TravelPlanner AI uses autonomous AI platforms and vector knowledge systems to generate travel suggestions, estimated costs, and day-by-day itineraries. While we strive for maximum accuracy, actual prices, opening hours, visa requirements, and venue availability may vary. Users are advised to confirm specific bookings directly with third-party providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Third-Party Bookings & Affiliate Links</h2>
          <p>
            TravelPlanner AI connects users with third-party travel partners (such as Booking.com, Agoda, Viator, GetYourGuide). All reservations, cancellations, and customer service inquiries regarding booked stays or tickets are managed directly by the respective third-party provider.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. User Accounts & Fair Use</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their login credentials. We reserve the right to suspend or terminate accounts that abuse our platform APIs or automated services.
          </p>
        </section>
      </div>
    </div>
  );
}

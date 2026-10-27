import React from 'react';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';

export default function TermsAndConditions() {
  return (
    <PublicLayout>
      <SEO
        title="Terms & Conditions | DriveElite Car Rental System"
        description="Review DriveElite's Terms & Conditions governing vehicle reservations, digital contracts, liabilities, and rental compliance in Pakistan."
        canonicalPath="/terms-and-conditions"
      />
      <div className="bg-white text-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Legal Terms</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
          <p className="text-xs text-slate-500">Effective Date: January 2026 • AutoRent Pakistan</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-2xl border border-slate-200 my-8 shadow-xs space-y-8 text-xs text-slate-700 leading-relaxed">
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
          Note: This document constitutes a professional draft. Final legal review by company legal counsel is required prior to commercial operations.
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">1. Eligibility Requirements</h2>
          <p>
            To rent a vehicle on AutoRent, the primary driver must be at least 21 years of age, hold a valid original CNIC or Passport, and possess a valid Pakistani Driving License with a minimum of 1 year driving experience.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">2. Vehicle Release & Prerequisites</h2>
          <p>
            Vehicle release is contingent upon: (a) Verified identity documents, (b) Fully paid rental fees and security deposit, (c) Signed e-contract or physical contract, and (d) Staff authorization checklist completion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">3. Prohibited Use & Penalties</h2>
          <p>
            Vehicles must not be used for illegal activities, subleasing, commercial racing, off-road driving, or operation by unlisted/unauthorized drivers. Violations result in immediate forfeiture of security deposit and contract termination.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">4. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

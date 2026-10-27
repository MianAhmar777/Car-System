import React from 'react';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <SEO
        title="Privacy Policy | DriveElite Car Rental System"
        description="Read the official Privacy Policy of DriveElite. Learn how we collect, store, encrypt, and protect your personal identification documents and rental data."
        canonicalPath="/privacy-policy"
      />
      <div className="bg-white text-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Legal Documentation</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: January 2026 • AutoRent Pakistan</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-2xl border border-slate-200 my-8 shadow-xs space-y-8 text-xs text-slate-700 leading-relaxed">
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
          Note: This is a professional draft policy for AutoRent Car Rental System. Specific legal clauses should be reviewed by company legal advisers prior to commercial production.
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            When registering an account, making a booking, or uploading verification documents on AutoRent, we collect personal identity information including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Full Name, Email Address, Mobile Phone Number, and Account Password.</li>
            <li>Scanned images of National Identity Card (CNIC) or Passport.</li>
            <li>Driving License details, issuing authority, and expiry date.</li>
            <li>Digital E-Signature evidence (IP address, user-agent string, and SHA-256 contract hashes).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">2. How We Use Your Data</h2>
          <p>We use your personal data strictly for operational rental services:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Verifying driver eligibility and age requirements.</li>
            <li>Generating legally binding digital rental contracts.</li>
            <li>Processing rental payments, security deposits, and invoices.</li>
            <li>Communicating booking updates, OTP verifications, and notifications.</li>
            <li>Complying with law enforcement regulations regarding vehicle release records.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">3. Document Security & Storage Isolation</h2>
          <p>
            Identity documents (CNICs, Driving Licenses) uploaded to AutoRent are stored in private bucket infrastructure (Supabase Storage / Local Private Storage). Access is restricted strictly to authorized staff reviewers via short-lived signed URLs. Unauthenticated users cannot view or download customer documents.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">4. Contact & Deletion Requests</h2>
          <p>
            For data protection inquiries or to request account deletion, contact our privacy team at <span className="font-bold text-slate-900">privacy@autorent.pk</span>.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

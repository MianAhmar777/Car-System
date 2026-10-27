import React from 'react';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';

export default function RentalPolicy() {
  return (
    <PublicLayout>
      <SEO
        title="Rental Policy & Rules | DriveElite"
        description="Understand DriveElite's vehicle rental policies, age restrictions, document requirements, cancellation rules, and pickup/return guidelines."
        canonicalPath="/rental-policy"
      />
      <div className="bg-white text-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Policy Guidelines</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Car Rental Policy</h1>
          <p className="text-xs text-slate-500">Rules & Procedures • AutoRent Pakistan</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-2xl border border-slate-200 my-8 shadow-xs space-y-8 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">1. Pickup & Return Inspections</h2>
          <p>
            Before taking possession of the vehicle, both customer and staff conduct a physical inspection. Mileage, fuel level, existing scratches, and interior condition are logged digitally in the inspection report. The vehicle must be returned in the same condition.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">2. Fuel & Mileage Policy</h2>
          <p>
            All rentals operate on a "Same-to-Same" fuel policy. If the vehicle is returned with less fuel than provided at pickup, refueling charges will be deducted from the security deposit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">3. Late Returns & Overtime Charges</h2>
          <p>
            A grace period of 59 minutes is granted for returns. Returns exceeding 1 hour without prior extension approval incur an hourly late fee or an additional full-day rental rate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">4. Cancellation & Refund Policy</h2>
          <p>
            Bookings cancelled 24 hours prior to pickup receive a 100% refund. Cancellations made within 24 hours incur a 1-day rental fee deduction.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

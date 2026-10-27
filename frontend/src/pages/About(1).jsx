import React from 'react';
import SEO from '../seo/SEO';
import PublicLayout from '../components/layout/PublicLayout';
import { ShieldCheck, Car, Award, Clock, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <PublicLayout>
      <SEO
        title="About DriveElite - Premier Car Rental Platform in Pakistan"
        description="Learn about DriveElite's mission to deliver transparent, paperless, and secure car rentals across Karachi, Lahore, Islamabad, and nationwide."
        canonicalPath="/about"
      />
      {/* Header Banner */}
      <div className="bg-white text-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            About AutoRent
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Pakistan's Premier Car Rental Platform
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Delivering safe, transparent, and hassle-free vehicle rentals across major cities with instant online booking and verified fleet assurance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Mission Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              Redefining Car Rentals with Technology & Transparency
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              AutoRent was founded to eliminate hidden fees, unreliable vehicles, and tedious paperwork from car rentals in Pakistan. We connect travelers, business professionals, and families with thoroughly inspected, insured vehicles.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <ShieldCheck className="w-6 h-6 text-sky-600" />
                <h4 className="text-sm font-bold text-slate-900">100% Verified Fleet</h4>
                <p className="text-xs text-slate-500">Every car undergoes 25-point mechanical checkups before release.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                <Clock className="w-6 h-6 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Instant Booking</h4>
                <p className="text-xs text-slate-500">Real-time availability and digital contract signing.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
              alt="Fleet Vehicles"
              className="rounded-2xl shadow-2xl object-cover h-96 w-full"
            />
          </div>
        </div>

        {/* Why Choose Us */}
        <div id="services" className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Why Customers Choose AutoRent</h2>
            <p className="text-xs text-slate-500">Built around safety, flexibility, and customer satisfaction.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Car,
                title: 'Wide Range of Cars',
                desc: 'From budget hatchbacks to premium luxury sedans and 7-seater SUVs.',
              },
              {
                icon: Award,
                title: 'Transparent Pricing',
                desc: 'No hidden surcharges. Clear daily, weekly, and monthly rates in PKR.',
              },
              {
                icon: ShieldCheck,
                title: 'Digital E-Contracts',
                desc: 'Secure digital signatures with tamper-proof cryptographic audit hashes.',
              },
              {
                icon: Users,
                title: '24/7 Dedicated Support',
                desc: 'On-road roadside assistance and customer service team.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-white rounded-3xl p-10 text-slate-900 text-center space-y-4 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Ready to Reserve Your Rental Vehicle?</h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Choose from our extensive fleet, select your pickup location, and complete your reservation in under 3 minutes.
          </p>
          <div className="pt-2">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Explore Fleet & Prices
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import SEO from '../seo/SEO';
import { Car, Search, ArrowRight, Home as HomeIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <PublicLayout>
      <SEO
        title="Page Not Found (404) | DriveElite Car Rentals"
        description="The requested page could not be found. Return to our homepage or search our fleet of rental cars."
        canonical="/404"
        noindex={true}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Car className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full uppercase tracking-wider">
            Error 404 &bull; Page Not Found
          </span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
            Looks like you've hit a dead end.
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            The link you followed may be broken, or the page may have been moved. Explore our popular vehicle fleet or return to our homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            to="/cars"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-sky-600" /> Browse Rental Fleet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Popular Categories Links */}
        <div className="pt-12 border-t border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Popular Destinations</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Economy Cars', path: '/categories/economy-cars' },
              { name: 'SUV Rentals', path: '/categories/suv-rental' },
              { name: 'Luxury Cars', path: '/categories/luxury-cars' },
              { name: 'Islamabad Branch', path: '/locations/islamabad' },
              { name: 'Lahore Branch', path: '/locations/lahore' },
              { name: 'Frequently Asked Questions', path: '/faq' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3.5 py-1.5 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

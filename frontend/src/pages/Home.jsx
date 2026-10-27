import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/axios';
import { formatPKR, getTodayDateStr, getTomorrowDateStr } from '../utils/formatters';
import CarCard from '../components/cars/CarCard';
import { CarSkeletonCard } from '../components/ui/Skeleton';
import { Search, Calendar, MapPin, ShieldCheck, Sparkles, Clock, CheckCircle2, Star, ArrowRight, Award, KeyRound, Car } from 'lucide-react';

import SEO from '../seo/SEO';
import { generateOrganizationSchema, generateWebSiteSchema } from '../seo/structuredData';

export default function Home() {
  const navigate = useNavigate();
  const todayStr = getTodayDateStr();
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Search Form State
  const [searchLocation, setSearchLocation] = useState('');
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(getTomorrowDateStr(todayStr));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, catRes, carRes] = await Promise.all([
          api.get('/locations'),
          api.get('/categories'),
          api.get('/cars'),
        ]);
        if (locRes.success) setLocations(locRes.data);
        if (catRes.success) setCategories(catRes.data);
        if (carRes.success) setFeaturedCars(carRes.data.slice(0, 6));
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append('locationId', searchLocation);
    if (pickupDate) params.append('pickupDate', pickupDate);
    if (returnDate) params.append('returnDate', returnDate);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <PublicLayout>
      <SEO
        title="Car Rental in Pakistan | Premium Fleet & Transparent Rates | DriveElite"
        description="Rent luxury sedans, SUVs, and economy cars in Pakistan with transparent daily rates, zero hidden fees, verified digital contracts, and instant pickup."
        canonical="/"
        structuredData={[generateOrganizationSchema(), generateWebSiteSchema()]}
      />
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-b from-sky-50/80 via-white to-slate-50 text-slate-900 pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200/80">
        {/* Decorative Light Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Premium Car Rental Marketplace
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Rent a Car Easily, Quickly and Transparently
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Explore Pakistan's verified fleet of economy, sedan, and luxury vehicles. Instant booking, digital e-contracts, and transparent daily PKR pricing.
            </p>
          </div>

          {/* HERO SEARCH WIDGET */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 text-slate-900 max-w-5xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" /> Pickup Location
                </label>
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select City / Airport</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-600" /> Pickup Date
                  </label>
                  <span className="text-[10px] text-slate-400">Min: Today</span>
                </div>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => {
                    const newPickup = e.target.value;
                    setPickupDate(newPickup);
                    if (returnDate && returnDate <= newPickup) {
                      setReturnDate(getTomorrowDateStr(newPickup));
                    }
                  }}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-600" /> Return Date
                  </label>
                  <span className="text-[10px] text-slate-400">Min: After pickup</span>
                </div>
                <input
                  type="date"
                  min={getTomorrowDateStr(pickupDate || todayStr)}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search Available Cars
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Why AutoRent</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Built for Trust, Speed & Safety</h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">Experience seamless car rentals tailored for business travelers and holiday rentals.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Vehicles',
                desc: 'Every vehicle undergoes 25-point physical & mechanical safety inspections.',
              },
              {
                icon: Award,
                title: 'Transparent Pricing',
                desc: 'Clear PKR daily rates with zero surprise charges or hidden fees.',
              },
              {
                icon: KeyRound,
                title: 'Digital E-Contracts',
                desc: 'Instant online paperless contract signing with cryptographic hash security.',
              },
              {
                icon: Clock,
                title: '24/7 Roadside Assistance',
                desc: 'Dedicated customer support team and roadside backup across major highways.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CARS MARKETPLACE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Featured Fleet</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Available Rental Vehicles</h2>
          </div>
          <Link
            to="/cars"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
          >
            View All Vehicles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CarSkeletonCard />
            <CarSkeletonCard />
            <CarSkeletonCard />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="py-16 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Explore Vehicle Categories</h2>
            <p className="text-xs text-slate-500">Select the vehicle class that best suits your trip.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/cars?categoryId=${cat.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition-all text-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">4 Easy Steps</span>
          <h2 className="text-3xl font-extrabold text-slate-900">How AutoRent Works</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {[
            { step: '01', title: 'Choose Vehicle', desc: 'Browse our fleet and select your preferred dates and location.' },
            { step: '02', title: 'Upload CNIC/License', desc: 'Provide identity verification for instant staff approval.' },
            { step: '03', title: 'E-Sign Contract', desc: 'Review and sign your digital rental contract paperlessly.' },
            { step: '04', title: 'Pick Up & Drive', desc: 'Inspect vehicle condition and receive keys at your selected hub.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 relative">
              <span className="text-3xl font-black text-sky-100 block">{item.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-slate-900 text-center space-y-5 shadow-sm border border-slate-200">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Ready to Hit the Road?</h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Book your car today with verified fleet protection and instant digital contracts.
          </p>
          <div className="pt-2">
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            >
              Browse Cars & Reserve Now
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

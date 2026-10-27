import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatPKR, getCarImageUrl } from '../../utils/formatters';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import { Car, Calendar, FileText, Shield, ArrowRight } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (isInitial = false) => {
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.success) setBookings(res.data);
    } catch (e) {
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(true);

    const intervalId = setInterval(() => {
      fetchBookings(false);
    }, 3000);

    const handleFocus = () => fetchBookings(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <PublicLayout>
      <SEO title="My Reservations | DriveElite" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Reservations</h1>
        <p className="text-sm text-slate-500 font-medium">View reservation details, invoices, and signed contracts.</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500 font-semibold">Loading reservations...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Reservations Found</h3>
          <p className="text-xs text-slate-500 mt-1">You haven't reserved any vehicles yet.</p>
          <Link to="/cars" className="inline-block mt-4 px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl">
            Browse Fleet Cars
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                  <img
                    src={getCarImageUrl(b.car)}
                    alt={`${b.car?.make || 'Vehicle'} ${b.car?.model || ''}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">#{b.bookingReference}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{b.car?.make} {b.car?.model}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(b.pickupDateTime).toLocaleDateString()} → {new Date(b.returnDateTime).toLocaleDateString()} ({b.rentalDays} Days)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">Total Amount</span>
                  <span className="text-xl font-extrabold text-slate-900">{formatPKR(b.totalAmount)}</span>
                </div>
                <Link
                  to={`/customer/bookings/${b.id}`}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-sky-600 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  View Details & Contract <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </PublicLayout>
  );
}

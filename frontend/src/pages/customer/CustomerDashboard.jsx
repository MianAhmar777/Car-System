import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatPKR } from '../../utils/formatters';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import CarCard from '../../components/cars/CarCard';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { 
  Car, FileCheck, Shield, Clock, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Search, Upload, Calendar, MapPin, User
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (isInitial = false) => {
    try {
      const [bkRes, docRes, carRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/documents/my-documents'),
        api.get('/cars'),
      ]);
      if (bkRes.success) setBookings(bkRes.data);
      if (docRes.success) setDocuments(docRes.data);
      if (carRes.success) {
        // Take top 4 available cars for showcase
        const available = carRes.data.filter(c => c.status === 'AVAILABLE' || c.isAvailable);
        setAvailableCars(available.slice(0, 4));
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);

    // 3-second auto-polling for real-time status updates without manual refresh
    const intervalId = setInterval(() => {
      fetchData(false);
    }, 3000);

    // Immediate refetch when switching back to this browser tab
    const handleFocus = () => fetchData(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const verifiedDocsCount = documents.filter((d) => d.verificationStatus === 'VERIFIED').length;
  const activeBooking = bookings.find((b) => ['PENDING', 'CONFIRMED', 'PICKED_UP', 'ACTIVE'].includes(b.status));

  return (
    <PublicLayout>
      <SEO title="Customer Portal Dashboard | DriveElite" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Header Banner - Clean White Theme */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Customer Portal
              </span>
              <Badge variant="success" className="text-[11px]">
                Account Verified
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user?.fullName || 'Valued Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Manage your vehicle reservations, upload driving credentials, review digital contracts, and track live vehicle release authorizations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              to="/cars"
              className="flex-1 md:flex-initial px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Browse Fleet Cars
            </Link>
            <Link
              to="/customer/documents"
              className="flex-1 md:flex-initial px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-sky-600" /> Upload Documents
            </Link>
          </div>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Bookings</span>
              <span className="text-2xl font-extrabold text-slate-900">{bookings.length}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Verified Documents</span>
              <span className="text-2xl font-extrabold text-slate-900">{verifiedDocsCount} Files</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Digital Contracts</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {bookings.filter(b => b.rentalContracts?.length > 0).length}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Security Status</span>
              <span className="text-sm font-extrabold text-emerald-600">Active & Eligible</span>
            </div>
          </div>
        </div>

        {/* Personal Details & Verification Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Personal Details & Account Profile</h2>
                <p className="text-xs text-slate-500">Your registered customer account information and identity credentials.</p>
              </div>
            </div>
            <Link
              to="/customer/documents"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Update Documents <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Full Name */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium text-[11px] block">Full Name</span>
              <p className="font-bold text-slate-900 text-sm truncate">{user?.fullName || 'Valued Customer'}</p>
              <span className="text-[10px] text-slate-500 block">Primary Account Holder</span>
            </div>

            {/* Email Address */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium text-[11px] block">Email Address</span>
              <p className="font-bold text-slate-900 text-sm truncate">{user?.email || 'N/A'}</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> OTP Verified
              </span>
            </div>

            {/* Contact Phone */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium text-[11px] block">Contact Phone</span>
              <p className="font-bold text-slate-900 text-sm">{user?.phone || '+92 300 1234567'}</p>
              <span className="text-[10px] text-slate-500 block">Rental Coordination</span>
            </div>

            {/* Account Role & Security */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-medium text-[11px] block">Account Status</span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {user?.role || 'CUSTOMER'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">Rental Authorization: Active</span>
            </div>
          </div>

          {/* Verification Credentials Status Bar */}
          <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Identity & Driving Eligibility Status</p>
                <p className="text-[11px] text-slate-600">
                  {verifiedDocsCount > 0
                    ? `You have ${verifiedDocsCount} verified document(s) on file (CNIC/Driving License).`
                    : 'Please ensure your driving license and CNIC/Passport are uploaded before car collection.'}
                </p>
              </div>
            </div>
            <Link
              to="/customer/documents"
              className="px-4 py-2 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 rounded-lg font-bold text-xs shrink-0 text-center transition-colors shadow-xs"
            >
              Manage Documents &rarr;
            </Link>
          </div>
        </div>

        {/* Active Reservation Tracker Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Reservation Center</span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {activeBooking ? `Active Rental: #${activeBooking.bookingReference}` : 'Active Reservation Status'}
              </h2>
            </div>
            <Link to="/customer/bookings" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All History ({bookings.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeBooking ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0">
                    <Car className="w-8 h-8 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {activeBooking.car?.make} {activeBooking.car?.model} ({activeBooking.car?.year || '2025'})
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />{' '}
                        {typeof activeBooking.pickupLocation === 'object'
                          ? activeBooking.pickupLocation?.name || activeBooking.pickupLocation?.city || 'Lahore Hub'
                          : activeBooking.pickupLocation || 'Lahore Hub'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />{' '}
                        {new Date(activeBooking.pickupDateTime || activeBooking.startDate || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Rental Fee</span>
                    <span className="text-base font-extrabold text-slate-900">{formatPKR(activeBooking.totalAmount)}</span>
                  </div>
                  <Link
                    to={`/customer/bookings/${activeBooking.id}`}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    Manage & Sign Contract <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 4-Step Release Workflow Checklist - Interactive & Clickable */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700">Vehicle Handover Checklist & Prerequisites</span>
                  <span className="text-[11px] font-semibold text-sky-600">Click any card to complete action →</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                  {/* Card 1: Payment */}
                  <Link
                    to={`/customer/bookings/${activeBooking.id}`}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                      activeBooking.paymentStatus === 'SUCCESS'
                        ? 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold flex items-center gap-1">
                        1. Payment
                      </span>
                      {activeBooking.paymentStatus === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium block">
                      {activeBooking.paymentStatus === 'SUCCESS' ? '✓ Verified Paid' : 'Payment Required'}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                      View Invoice <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>

                  {/* Card 2: Documents */}
                  <Link
                    to="/customer/documents"
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                      verifiedDocsCount > 0
                        ? 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold flex items-center gap-1">
                        2. Documents
                      </span>
                      {verifiedDocsCount > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium block">
                      {verifiedDocsCount > 0 ? 'CNIC/License Valid' : 'Upload Required'}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                      Upload Files <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>

                  {/* Card 3: E-Contract */}
                  <Link
                    to={
                      activeBooking.rentalContracts && activeBooking.rentalContracts[0]
                        ? `/customer/contracts/${activeBooking.rentalContracts[0].id}`
                        : `/customer/bookings/${activeBooking.id}`
                    }
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                      activeBooking.rentalContracts?.[0]?.status === 'VERIFIED' ||
                      activeBooking.rentalContracts?.[0]?.status === 'SIGNED_BY_CUSTOMER'
                        ? 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold flex items-center gap-1">
                        3. E-Contract
                      </span>
                      {activeBooking.rentalContracts?.[0]?.status === 'VERIFIED' ||
                      activeBooking.rentalContracts?.[0]?.status === 'SIGNED_BY_CUSTOMER' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium block">
                      {activeBooking.rentalContracts?.[0]?.status || 'Pending Signature'}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                      Review & Sign <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>

                  {/* Card 4: Handover */}
                  <Link
                    to={`/customer/bookings/${activeBooking.id}`}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 ${
                      activeBooking.releaseAuthorization?.isAuthorized
                        ? 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold flex items-center gap-1">
                        4. Handover
                      </span>
                      {activeBooking.releaseAuthorization?.isAuthorized ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium block">
                      {activeBooking.releaseAuthorization?.isAuthorized ? 'Keys Authorized' : 'Staff Check Pending'}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                      Pickup Info <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">No Active Reservations</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  You currently have no active rental bookings. Browse our fleet of verified vehicles and reserve instantly.
                </p>
              </div>
              <Link
                to="/cars"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Browse Fleet Cars <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/cars"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center justify-between">
                Browse Marketplace Cars <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore sedan, SUV, hatchback, and luxury options with real-time PKR daily rates.
              </p>
            </div>
          </Link>

          <Link
            to="/customer/documents"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                Document Upload & Verification <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload CNIC front/back and valid Driving License for instant paperless eligibility.
              </p>
            </div>
          </Link>

          <Link
            to="/customer/bookings"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                My Bookings & Invoices <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Access rental receipts, inspect previous contracts, and download signed agreements.
              </p>
            </div>
          </Link>
        </div>

        {/* Featured Available Vehicles ("cars etc etc") */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Available Fleet Showcase</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">Explore Available Vehicles</h2>
            </div>
            <Link to="/cars" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All Cars <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : availableCars.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No vehicles available at this moment. Check back soon!
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

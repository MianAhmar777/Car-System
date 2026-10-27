import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import api from '../../api/axios';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Car, DollarSign, Users, Shield, FileText, Activity, 
  AlertTriangle, FileCheck, Eye, CheckCircle, XCircle, ArrowRight, 
  Download, Printer, Search, Filter, RefreshCw, Key, Check, Clock, X, File,
  Globe, ExternalLink, Code
} from 'lucide-react';
import { formatPKR } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { printInvoice, printContract, printHandoverReceipt } from '../../utils/printable';
import SEO from '../../seo/SEO';

export default function AdminDashboard() {
  const { showToast } = useNotification();
  const [stats, setStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [allContracts, setAllContracts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'documents' | 'contracts' | 'audit' | 'seo'
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // SERP Interactive Simulator State
  const [serpTitle, setSerpTitle] = useState('Rent Luxury & Economy Cars in Pakistan | DriveElite');
  const [serpDescription, setSerpDescription] = useState('Reserve premium vehicles with transparent PKR rates, instant digital contract signing, and verified door-to-door delivery.');
  const [serpPath, setSerpPath] = useState('/cars/toyota-fortuner-v8-rent');
  const [seoOverview, setSeoOverview] = useState(null);

  // Modals state
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [selectedDocCustomer, setSelectedDocCustomer] = useState(null);
  const [selectedContractBooking, setSelectedContractBooking] = useState(null);
  const [selectedHandoverBooking, setSelectedHandoverBooking] = useState(null);

  const fetchDashboardData = async (isInitial = false) => {
    try {
      const [statsRes, bookingsRes, docsRes, contractsRes, auditRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/bookings/all'),
        api.get('/documents/all'),
        api.get('/contracts/all'),
        api.get('/audit?limit=30'),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (bookingsRes.success) setAllBookings(bookingsRes.data);
      if (docsRes.success) setAllDocuments(docsRes.data);
      if (contractsRes.success) setAllContracts(contractsRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (e) {
      if (isInitial) showToast('Failed to load admin analytics.', 'error');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);

    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, 3000);

    const handleFocus = () => fetchDashboardData(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'seo') {
      api.get('/seo/overview').then((res) => {
        if (res.success) setSeoOverview(res.data);
      }).catch(() => {});
    }
  }, [activeTab]);

  const handleVerifyDocument = async (docId, approved, reason = '') => {
    try {
      const res = await api.patch(`/documents/${docId}/verify`, { approved, rejectionReason: reason });
      if (res.success) {
        showToast(approved ? 'Document verified & approved!' : 'Document rejected.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleReviewContract = async (contractId, approved, reason = '') => {
    try {
      const res = await api.patch(`/contracts/${contractId}/review`, { approved, rejectionReason: reason });
      if (res.success) {
        showToast(approved ? 'Contract approved!' : 'Contract rejected.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, { status });
      if (res.success) {
        showToast(`Booking status updated to ${status}!`, 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  if (loading || !stats) {
    return (
      <PublicLayout>
        <div className="p-16 text-center text-slate-500 font-semibold text-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
          Loading enterprise admin management portal...
        </div>
      </PublicLayout>
    );
  }

  // Pending items counts
  const pendingDocsList = allDocuments.filter(d => d.verificationStatus === 'PENDING');
  const pendingContractsList = allContracts.filter(c => ['SIGNED_BY_CUSTOMER', 'UPLOADED_BY_CUSTOMER'].includes(c.status));

  // Filtered Bookings
  const filteredBookings = allBookings.filter(b => {
    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      b.bookingReference?.toLowerCase().includes(q) ||
      b.customer?.fullName?.toLowerCase().includes(q) ||
      b.customer?.email?.toLowerCase().includes(q) ||
      b.car?.make?.toLowerCase().includes(q) ||
      b.car?.model?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <PublicLayout>
      <SEO title="System Admin Control Center | DriveElite" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Executive Header Banner - Clean White Background */}
        <div className="bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="z-10">
            <span className="px-3 py-1 bg-sky-50 text-sky-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-sky-200/80">
              Admin & Operations Command Center
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">Car Rental Management Dashboard</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">Real-time status tracking, document verification, e-contracts, & vehicle handover control.</p>
          </div>

          <div className="flex items-center gap-3 z-10 self-start sm:self-center">
            <button 
              onClick={() => fetchDashboardData(false)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" /> Refresh Data
            </button>
            <Link
              to="/staff"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-95"
            >
              Staff Pickup Desk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Metrics Overview Cards - All Hoverable & Clickable */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Fleet Vehicles */}
          <div 
            onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('ALL'); }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-sky-600 transition-colors">Fleet Vehicles</span>
              <Car className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900">{stats.vehicles?.total || 0}</span>
            <span className="block text-xs font-semibold text-emerald-600 mt-1">
              Utilization: {stats.vehicles?.utilizationRate || '0%'}
            </span>
          </div>

          {/* Card 2: Gross Revenue */}
          <div 
            onClick={() => { setActiveTab('bookings'); setBookingStatusFilter('COMPLETED'); }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Gross Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900">{formatPKR(stats.financials?.totalRevenue || 0)}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">Verified payments &bull; Click to view</span>
          </div>

          {/* Card 3: Customer Accounts */}
          <div 
            onClick={() => setActiveTab('documents')}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Customer Accounts</span>
              <Users className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900">{stats.customers || 0}</span>
            <span className="block text-xs font-semibold text-sky-600 mt-1">Registered accounts &bull; View Docs</span>
          </div>

          {/* Card 4: Action Required */}
          <div 
            onClick={() => {
              if (pendingDocsList.length > 0) setActiveTab('documents');
              else if (pendingContractsList.length > 0) setActiveTab('contracts');
              else setActiveTab('bookings');
            }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Action Required</span>
              <AlertTriangle className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900">
              {pendingDocsList.length + pendingContractsList.length}
            </span>
            <span className="block text-xs font-semibold text-amber-600 mt-1">
              {pendingDocsList.length} Pending Docs / {pendingContractsList.length} Contracts
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Clean Interactive Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Car className="w-4 h-4" /> All Rentals & Lifecycle Statuses ({allBookings.length})
          </button>
          
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Customer Documents Queue
            {pendingDocsList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-amber-950 rounded-full animate-pulse">
                {pendingDocsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'contracts'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" /> E-Contracts Review Queue
            {pendingContractsList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-amber-950 rounded-full animate-pulse">
                {pendingContractsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" /> System Audit Trail
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'seo'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" /> SEO & Indexation Control
          </button>
        </div>

        {/* TAB 1: ALL BOOKINGS & 4-PILLAR LIFECYCLE CONTROLS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by ref #, customer name, email, or car..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {['ALL', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      bookingStatusFilter === st
                        ? 'bg-slate-900 text-white scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Master Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-3">Booking & Customer</th>
                    <th className="p-3">1. Payment Status</th>
                    <th className="p-3">2. Documents</th>
                    <th className="p-3">3. E-Contract</th>
                    <th className="p-3">4. Handover & Inspection</th>
                    <th className="p-3">Overall Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No rental bookings match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const contract = b.rentalContracts?.[0];
                      const releaseAuth = b.releaseAuthorization;
                      const customerDocs = allDocuments.filter(d => d.userId === b.customerId);
                      const isDocsVerified = customerDocs.length > 0 && customerDocs.every(d => d.verificationStatus === 'APPROVED');
                      const isDocsPending = customerDocs.some(d => d.verificationStatus === 'PENDING');

                      // Safe Date Parsing
                      const startVal = b.startDate || b.pickupDateTime;
                      const endVal = b.endDate || b.returnDateTime;
                      const formattedDates = (startVal && endVal && !isNaN(new Date(startVal).getTime()))
                        ? `${new Date(startVal).toLocaleDateString()} — ${new Date(endVal).toLocaleDateString()}`
                        : 'Dates set at pickup';

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* Booking & Customer info - Hoverable & Clickable */}
                          <td className="p-3">
                            <span 
                              onClick={() => setSelectedHandoverBooking(b)}
                              className="font-bold text-slate-900 font-mono text-[11px] block hover:text-sky-600 cursor-pointer transition-colors"
                            >
                              #{b.bookingReference}
                            </span>
                            <span 
                              onClick={() => setSelectedDocCustomer({ user: b.customer, docs: customerDocs })}
                              className="font-semibold text-slate-800 block text-xs mt-0.5 hover:text-sky-600 cursor-pointer transition-colors"
                              title="Click to view customer documents"
                            >
                              {b.customer?.fullName || 'Customer'}
                            </span>
                            <span className="text-[11px] text-slate-500 block">{b.car?.make} {b.car?.model}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{formattedDates}</span>
                          </td>

                          {/* 1. Payment Indicator & Action */}
                          <td className="p-3">
                            <div className="space-y-1.5">
                              <div onClick={() => setSelectedInvoiceBooking(b)} className="cursor-pointer hover:scale-105 transition-all w-fit">
                                {b.paymentStatus === 'SUCCESS' ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Check className="w-3 h-3" /> Verified Paid
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Clock className="w-3 h-3" /> Pending Payment
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-slate-900 block text-xs">{formatPKR(b.totalAmount + b.securityDeposit)}</span>
                              <button
                                onClick={() => setSelectedInvoiceBooking(b)}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs active:scale-95"
                              >
                                <FileText className="w-3 h-3" /> View / Download Invoice
                              </button>
                            </div>
                          </td>

                          {/* 2. Customer Documents Indicator & Action */}
                          <td className="p-3">
                            <div className="space-y-1.5">
                              <div onClick={() => setSelectedDocCustomer({ user: b.customer, docs: customerDocs })} className="cursor-pointer hover:scale-105 transition-all w-fit">
                                {isDocsVerified ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <CheckCircle className="w-3 h-3" /> CNIC / License Valid
                                  </span>
                                ) : isDocsPending ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Clock className="w-3 h-3" /> Pending Review
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 w-fit shadow-2xs">
                                    <AlertTriangle className="w-3 h-3" /> {customerDocs.length} Uploaded
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setSelectedDocCustomer({ user: b.customer, docs: customerDocs })}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs active:scale-95"
                              >
                                <Eye className="w-3 h-3" /> View / Review Docs
                              </button>
                            </div>
                          </td>

                          {/* 3. E-Contract Indicator & Action */}
                          <td className="p-3">
                            <div className="space-y-1.5">
                              <div onClick={() => contract && setSelectedContractBooking({ contract, booking: b })} className="cursor-pointer hover:scale-105 transition-all w-fit">
                                {contract?.status === 'APPROVED' ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Shield className="w-3 h-3" /> Contract VERIFIED
                                  </span>
                                ) : contract?.status === 'SIGNED_BY_CUSTOMER' ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-sky-100 text-sky-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Check className="w-3 h-3" /> Signed & Pending Review
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 w-fit shadow-2xs">
                                    <Clock className="w-3 h-3" /> {contract ? contract.status : 'Not Generated'}
                                  </span>
                                )}
                              </div>
                              {contract && (
                                <button
                                  onClick={() => setSelectedContractBooking({ contract, booking: b })}
                                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs active:scale-95"
                                >
                                  <FileText className="w-3 h-3" /> Review & Sign / PDF
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 4. Handover & Release Indicator & Action */}
                          <td className="p-3">
                            <div className="space-y-1.5">
                              <div onClick={() => setSelectedHandoverBooking(b)} className="cursor-pointer hover:scale-105 transition-all w-fit">
                                {releaseAuth?.isAuthorized ? (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Key className="w-3 h-3" /> Keys Authorized
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit shadow-2xs">
                                    <Clock className="w-3 h-3" /> Checklist Incomplete
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setSelectedHandoverBooking(b)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:shadow-xs active:scale-95"
                              >
                                <Key className="w-3 h-3" /> Handover & Inspections
                              </button>
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td className="p-3">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[11px] text-slate-800 focus:ring-2 focus:ring-sky-500 cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: PENDING DOCUMENTS QUEUE */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customer Identity Document Verification Queue</h3>
                <p className="text-xs text-slate-500 font-medium">Review uploaded CNIC, Driving License, & Address proof documents.</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                {pendingDocsList.length} Pending
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDocuments.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-400 text-xs">
                  No document records found in system.
                </div>
              ) : (
                allDocuments.map((doc) => (
                  <div key={doc.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative hover:shadow-md hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {doc.user?.fullName || 'Customer'}
                        </span>
                        <span className="text-[11px] font-bold text-sky-600 block mt-0.5">
                          {doc.documentType}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        doc.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      File: {doc.fileName}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                      {doc.signedUrl ? (
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview / Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-italic">No file link</span>
                      )}

                      {doc.verificationStatus === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleVerifyDocument(doc.id, true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerifyDocument(doc.id, false, 'Invalid or unreadable document')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONTRACTS REVIEW QUEUE */}
        {activeTab === 'contracts' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">E-Contracts Review & Verification Queue</h3>
                <p className="text-xs text-slate-500 font-medium">Approve signed rental contracts or inspect customer upload PDFs.</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                {pendingContractsList.length} Awaiting Approval
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allContracts.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-400 text-xs">
                  No contract records generated yet.
                </div>
              ) : (
                allContracts.map((c) => {
                  const relatedBooking = allBookings.find(b => b.id === c.bookingId);
                  return (
                    <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:shadow-md hover:border-slate-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold font-mono text-slate-900 text-xs block">
                            Contract #{c.contractNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Customer: {relatedBooking?.customer?.fullName || 'N/A'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                        <button
                          onClick={() => setSelectedContractBooking({ contract: c, booking: relatedBooking })}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review / Print PDF
                        </button>

                        {['SIGNED_BY_CUSTOMER', 'UPLOADED_BY_CUSTOMER'].includes(c.status) && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleReviewContract(c.id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewContract(c.id, false, 'Signature or term verification missing')}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" /> Administrative System Audit Trail
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-900">{log.user?.fullName || 'System'}</td>
                      <td className="p-3 text-sky-600 font-bold">{log.action}</td>
                      <td className="p-3 text-slate-600">{log.entity}</td>
                      <td className="p-3 text-slate-500">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ENTERPRISE SEO MANAGEMENT & SERP SIMULATOR */}
        {activeTab === 'seo' && (
          <div className="space-y-8">
            {/* SEO Architecture Status Header */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-emerald-200">
                      System Status: Enterprise Ready
                    </span>
                    <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-bold text-[11px] rounded-full">
                      Zero-Lag Dynamic Directives
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">SEO Engine & Search Indexation Control</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage metadata, test live Google Search result snippets, inspect dynamic XML sitemaps, and verify private route shielding.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="http://localhost:5000/api/v1/seo/robots.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <Code className="w-4 h-4 text-sky-600" /> View robots.txt <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="http://localhost:5000/api/v1/seo/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4 text-white" /> View sitemap.xml <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Dynamic Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Indexed Pages</span>
                  <span className="text-2xl font-black text-slate-900">{seoOverview?.totalIndexedUrls || 15}</span>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">Dynamic XML Sitemap</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Fleet Car Landings</span>
                  <span className="text-2xl font-black text-slate-900">{seoOverview?.breakdown?.carDetailPages || 0}</span>
                  <span className="text-[11px] text-sky-600 font-bold block mt-0.5">Schema.org Product Validated</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Category / City Hubs</span>
                  <span className="text-2xl font-black text-slate-900">
                    {(seoOverview?.breakdown?.categoryLandingPages || 0) + (seoOverview?.breakdown?.locationLandingPages || 0)}
                  </span>
                  <span className="text-[11px] text-indigo-600 font-bold block mt-0.5">Canonical & Breadcrumbs</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Shielded Routes</span>
                  <span className="text-2xl font-black text-slate-900">12</span>
                  <span className="text-[11px] text-amber-600 font-bold block mt-0.5">Explicit noindex,nofollow</span>
                </div>
              </div>
            </div>

            {/* GOOGLE SEARCH RESULT SIMULATOR & PREVIEW */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Google SERP Live Snippet Simulator</h3>
                <p className="text-xs text-slate-500 font-medium">Test how marketplace pages appear in Google Search results and social media cards.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Form Controls */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SEO Title Tag (&lt;title&gt;)</label>
                    <input
                      type="text"
                      value={serpTitle}
                      onChange={(e) => setSerpTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Length: {serpTitle.length} chars</span>
                      <span className={serpTitle.length >= 50 && serpTitle.length <= 60 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                        Optimal: 50-60 chars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Meta Description (&lt;meta name="description"&gt;)</label>
                    <textarea
                      rows={3}
                      value={serpDescription}
                      onChange={(e) => setSerpDescription(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Length: {serpDescription.length} chars</span>
                      <span className={serpDescription.length >= 140 && serpDescription.length <= 160 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                        Optimal: 140-160 chars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Canonical URL Path</label>
                    <input
                      type="text"
                      value={serpPath}
                      onChange={(e) => setSerpPath(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Google Search Result Box */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Google Search Result Preview</span>

                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span className="w-4 h-4 bg-sky-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">D</span>
                      <span className="text-[12px] font-medium text-slate-800">DriveElite Pakistan</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-[12px] text-slate-600 font-mono truncate max-w-xs">
                        https://driveelite.com{serpPath}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                      {serpTitle || 'Untitled Page'}
                    </h3>

                    <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                      {serpDescription || 'No meta description provided for search engine preview.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">✓ JSON-LD Schema</span>
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md">✓ OpenGraph Tags</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">✓ Twitter/X Cards</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">✓ Clean Canonical Link</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTE INDEXATION POLICY MATRIX */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900">Application Route Indexation Governance Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
                    <tr>
                      <th className="p-3">Route Pattern</th>
                      <th className="p-3">Route Type</th>
                      <th className="p-3">Indexation Directives</th>
                      <th className="p-3">Structured Data / Schema</th>
                      <th className="p-3">Canonical Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-sky-600">/</td>
                      <td className="p-3 text-slate-700">Marketplace Homepage</td>
                      <td className="p-3 font-bold text-emerald-600">index, follow</td>
                      <td className="p-3 text-slate-600">Organization, WebSite</td>
                      <td className="p-3 font-mono text-slate-500">https://driveelite.com/</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-sky-600">/cars, /cars/:id</td>
                      <td className="p-3 text-slate-700">Fleet Listing & Detail</td>
                      <td className="p-3 font-bold text-emerald-600">index, follow</td>
                      <td className="p-3 text-slate-600">Product, Offer, Breadcrumbs</td>
                      <td className="p-3 font-mono text-slate-500">Normalized Path</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-sky-600">/categories/:slug, /locations/:slug</td>
                      <td className="p-3 text-slate-700">Category & City Landing</td>
                      <td className="p-3 font-bold text-emerald-600">index, follow</td>
                      <td className="p-3 text-slate-600">LocalBusiness, BreadcrumbList</td>
                      <td className="p-3 font-mono text-slate-500">Normalized Slug Path</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-sky-600">/about, /contact, /faq, /terms...</td>
                      <td className="p-3 text-slate-700">Informational & Legal</td>
                      <td className="p-3 font-bold text-emerald-600">index, follow</td>
                      <td className="p-3 text-slate-600">FAQPage, LocalBusiness</td>
                      <td className="p-3 font-mono text-slate-500">Normalized URL Path</td>
                    </tr>
                    <tr className="hover:bg-amber-50/50 bg-amber-50/20">
                      <td className="p-3 font-mono font-bold text-amber-700">/customer/*, /staff/*, /admin/*</td>
                      <td className="p-3 text-amber-900 font-medium">Private Portals & Dashboards</td>
                      <td className="p-3 font-bold text-amber-700">noindex, nofollow, noarchive</td>
                      <td className="p-3 text-slate-400">None (Shielded)</td>
                      <td className="p-3 font-mono text-slate-400">Not Applicable</td>
                    </tr>
                    <tr className="hover:bg-amber-50/50 bg-amber-50/20">
                      <td className="p-3 font-mono font-bold text-amber-700">/login, /register, /booking</td>
                      <td className="p-3 text-amber-900 font-medium">Auth & Reservation Stepper</td>
                      <td className="p-3 font-bold text-amber-700">noindex, nofollow, noarchive</td>
                      <td className="p-3 text-slate-400">None (Shielded)</td>
                      <td className="p-3 font-mono text-slate-400">Not Applicable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: VIEW & DOWNLOAD INVOICE MODAL */}
        {selectedInvoiceBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setSelectedInvoiceBooking(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">OFFICIAL INVOICE</span>
                  <h2 className="text-2xl font-black text-slate-900">
                    Invoice #{selectedInvoiceBooking.invoices?.[0]?.invoiceNumber || selectedInvoiceBooking.bookingReference}
                  </h2>
                </div>
                <button
                  onClick={() => printInvoice(selectedInvoiceBooking)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Download / Print Invoice PDF
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Billed Customer</span>
                  <strong className="text-slate-900 text-sm">{selectedInvoiceBooking.customer?.fullName || 'Customer'}</strong>
                  <span className="block text-slate-600 mt-0.5">Email: {selectedInvoiceBooking.customer?.email || 'N/A'}</span>
                  <span className="block text-slate-600">Phone: {selectedInvoiceBooking.customer?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Rental Vehicle</span>
                  <strong className="text-slate-900 text-sm">{selectedInvoiceBooking.car?.make} {selectedInvoiceBooking.car?.model}</strong>
                  <span className="block text-slate-600 mt-0.5">Registration Plate: {selectedInvoiceBooking.car?.registrationNumber || 'N/A'}</span>
                  <span className="block text-slate-600">Period: {selectedInvoiceBooking.rentalDays} Days</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Base Rental Rate ({selectedInvoiceBooking.rentalDays} Days)</span>
                  <span className="font-bold text-slate-900">{formatPKR(selectedInvoiceBooking.basePrice)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Additional Services Fee</span>
                  <span className="font-bold text-slate-900">{formatPKR(selectedInvoiceBooking.servicesFee)}</span>
                </div>
                {selectedInvoiceBooking.discountAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-600">
                    <span>Applied Discount</span>
                    <span className="font-bold">-{formatPKR(selectedInvoiceBooking.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Estimated Taxes (10%)</span>
                  <span className="font-bold text-slate-900">{formatPKR(selectedInvoiceBooking.taxAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 font-semibold">
                  <span className="text-slate-700">Refundable Security Deposit</span>
                  <span className="font-bold text-slate-900">{formatPKR(selectedInvoiceBooking.securityDeposit)}</span>
                </div>

                <div className="flex justify-between pt-4 text-base font-extrabold text-slate-900 border-t border-slate-200">
                  <span>Total Amount Payable</span>
                  <span className="text-emerald-600">{formatPKR(selectedInvoiceBooking.totalAmount + selectedInvoiceBooking.securityDeposit)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedInvoiceBooking(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CUSTOMER DOCUMENTS VIEW & DOWNLOAD MODAL */}
        {selectedDocCustomer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setSelectedDocCustomer(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">CUSTOMER DOCUMENTS REVIEW</span>
                <h2 className="text-2xl font-black text-slate-900">{selectedDocCustomer.user?.fullName || 'Customer'}</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  CNIC/Passport: <strong className="text-slate-800">{selectedDocCustomer.user?.cnicPassport || 'Not provided'}</strong> | License #: <strong className="text-slate-800">{selectedDocCustomer.user?.licenseNumber || 'Not provided'}</strong>
                </p>
              </div>

              {selectedDocCustomer.docs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No files uploaded by this customer yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDocCustomer.docs.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{doc.documentType}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">File: {doc.fileName}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          doc.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </div>

                      {/* File preview frame if image */}
                      {doc.signedUrl && (
                        <div className="bg-slate-900 rounded-xl overflow-hidden max-h-64 flex items-center justify-center p-2">
                          <img
                            src={doc.signedUrl}
                            alt={doc.documentType}
                            className="max-h-60 max-w-full object-contain rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        {doc.signedUrl && (
                          <a
                            href={doc.signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
                          >
                            <Download className="w-4 h-4" /> Download Original Document File
                          </a>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerifyDocument(doc.id, true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            Approve Document
                          </button>
                          <button
                            onClick={() => handleVerifyDocument(doc.id, false, 'Document unreadable or invalid')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedDocCustomer(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: E-CONTRACT REVIEW & DOWNLOAD MODAL */}
        {selectedContractBooking && (() => {
          const c = selectedContractBooking.contract;
          const b = selectedContractBooking.booking || c.booking;
          const latestVersion = c.versions?.[0];
          const signature = c.signatures?.[0];
          const uploadedDoc = c.documents?.[0];
          const customerObj = b?.customer || c.customer;

          const startVal = b?.startDate || b?.pickupDateTime;
          const endVal = b?.endDate || b?.returnDateTime;
          const formattedPeriod = (startVal && endVal && !isNaN(new Date(startVal).getTime()))
            ? `${new Date(startVal).toLocaleDateString()} to ${new Date(endVal).toLocaleDateString()}`
            : 'Dates set at pickup';

          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <button
                  onClick={() => setSelectedContractBooking(null)}
                  className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Top Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">#{c.contractNumber}</span>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800">
                        Version v{latestVersion?.versionNumber || c.currentVersion || 1}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        c.status === 'VERIFIED' || c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Vehicle Rental Agreement</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.pdfUrl && (
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
                      >
                        <Download className="w-4 h-4" /> Download PDF Contract
                      </a>
                    )}
                    <button
                      onClick={() => printContract(c, b)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Print PDF
                    </button>
                  </div>
                </div>

                {/* Main Document Body Box */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5">
                  <div className="border-b border-slate-200 pb-3 text-center">
                    <h3 className="text-lg font-black text-slate-900 tracking-wide">AUTOMOTIVE RENTAL AGREEMENT</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Checksum SHA-256: <span className="font-semibold text-slate-700">{latestVersion?.checksum || signature?.documentHash || 'Verified'}</span>
                    </p>
                  </div>

                  {/* Section 1: Financial & Booking Details */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 text-sm">1. Booking Details & Financial Terms</h4>
                    <div className="grid sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                        <strong className="text-slate-900 text-xs">{customerObj?.fullName || 'Valued Customer'}</strong> ({customerObj?.email || 'N/A'})
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle</span>
                        <strong className="text-slate-900 text-xs">{b?.car?.make} {b?.car?.model}</strong> [Reg: {b?.car?.registrationNumber || 'N/A'}]
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Rental Period</span>
                        <strong className="text-slate-900 text-xs">{formattedPeriod}</strong> ({b?.rentalDays || 1} Days)
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Financial Terms</span>
                        <strong className="text-slate-900 text-xs">Total: {formatPKR(b?.totalAmount || 0)}</strong> | Security Deposit: {formatPKR(b?.securityDeposit || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Terms & Conditions */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 text-sm">2. Mandatory Terms & Conditions</h4>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                      {latestVersion?.contentSnapshot || (
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>1. RENTAL PERIOD & VEHICLE HANDOVER: The Lessor agrees to rent the specified vehicle to Lessee for the selected dates. Lessee agrees to return the vehicle in identical condition at the agreed return location.</li>
                          <li>2. SECURITY DEPOSIT: The Lessee provides a refundable security deposit to cover potential toll violations, fuel shortages, or minor damage.</li>
                          <li>3. DIGITAL SIGNATURE IMMUTABILITY: Electronic signatures executed inside this application or verified PDF document uploads represent binding legal consent under standard digital transaction laws.</li>
                        </ol>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Signature Status & Recorded Evidence */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Signature Status</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {signature
                            ? `Signed by ${signature.user?.fullName || customerObj?.fullName} on ${new Date(signature.signedAt).toLocaleString()}`
                            : uploadedDoc
                            ? `Offline signed document uploaded: ${uploadedDoc.fileName}`
                            : 'Contract requires customer signature.'}
                        </p>
                      </div>

                      {(signature || uploadedDoc || c.status === 'SIGNED_BY_CUSTOMER' || c.status === 'VERIFIED') ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center gap-1.5 w-fit">
                          <CheckCircle className="w-4 h-4" /> Signature Recorded & Locked
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg flex items-center gap-1.5 w-fit">
                          <Clock className="w-4 h-4" /> Pending Signature
                        </span>
                      )}
                    </div>

                    {/* Signature Image Drawing Preview */}
                    {signature?.signatureData && (
                      <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Recorded E-Signature Drawing</span>
                        <img
                          src={signature.signatureData}
                          alt="Customer Signature"
                          className="max-h-24 object-contain"
                        />
                        <div className="text-[10px] text-slate-400 font-mono mt-2 text-center">
                          IP: {signature.ipAddress || '127.0.0.1'} | Timestamp: {new Date(signature.signedAt).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Signed Document File */}
                    {uploadedDoc && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-800">Uploaded Document: {uploadedDoc.fileName}</span>
                        {c.pdfUrl && (
                          <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline">
                            View Uploaded File
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Review Controls */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  {['SIGNED_BY_CUSTOMER', 'UPLOADED_BY_CUSTOMER'].includes(c.status) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleReviewContract(c.id, true);
                          setSelectedContractBooking(null);
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        Approve Contract
                      </button>
                      <button
                        onClick={() => {
                          handleReviewContract(c.id, false, 'Signature or term verification missing');
                          setSelectedContractBooking(null);
                        }}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        Reject Contract
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedContractBooking(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl ml-auto cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL 4: HANDOVER & INSPECTION DETAIL MODAL */}
        {selectedHandoverBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setSelectedHandoverBooking(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">HANDOVER & INSPECTIONS</span>
                  <h2 className="text-2xl font-black text-slate-900">
                    Booking #{selectedHandoverBooking.bookingReference}
                  </h2>
                </div>

                <button
                  onClick={() => printHandoverReceipt(selectedHandoverBooking, selectedHandoverBooking.releaseAuthorization, selectedHandoverBooking.inspections)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Download Handover Receipt
                </button>
              </div>

              {/* 4-Point Checklist Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-900 text-sm block">4-Point Vehicle Release Checklist</span>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <span>1. Payment Status:</span>
                    <strong className={selectedHandoverBooking.releaseAuthorization?.checklist?.isPaid ? 'text-emerald-600' : 'text-amber-600'}>
                      {selectedHandoverBooking.releaseAuthorization?.checklist?.isPaid ? '✓ PAID' : '✗ PENDING'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <span>2. Customer Documents:</span>
                    <strong className={selectedHandoverBooking.releaseAuthorization?.checklist?.isDocumentVerified ? 'text-emerald-600' : 'text-amber-600'}>
                      {selectedHandoverBooking.releaseAuthorization?.checklist?.isDocumentVerified ? '✓ VERIFIED' : '✗ PENDING'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <span>3. Contract Status:</span>
                    <strong className={selectedHandoverBooking.releaseAuthorization?.checklist?.isContractSigned ? 'text-emerald-600' : 'text-amber-600'}>
                      {selectedHandoverBooking.releaseAuthorization?.checklist?.isContractSigned ? '✓ SIGNED' : '✗ PENDING'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <span>4. Inspection Checked:</span>
                    <strong className={selectedHandoverBooking.releaseAuthorization?.checklist?.isPrePickupInspected ? 'text-emerald-600' : 'text-amber-600'}>
                      {selectedHandoverBooking.releaseAuthorization?.checklist?.isPrePickupInspected ? '✓ PASSED' : '✗ PENDING'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Vehicle Inspection Records */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-900 text-sm block">Vehicle Inspection Logs</span>
                {selectedHandoverBooking.inspections?.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-italic text-center">
                    No physical vehicle inspection recorded yet.
                  </div>
                ) : (
                  selectedHandoverBooking.inspections.map((ins) => (
                    <div key={ins.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Inspection Type: <span className="text-sky-600">{ins.type}</span></span>
                        <span>{new Date(ins.inspectedAt).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <div>Odometer: <strong>{ins.mileage} KM</strong></div>
                        <div>Fuel Level: <strong>{ins.fuelLevel}% Full</strong></div>
                      </div>
                      {ins.notes && <div className="text-slate-600">Notes: {ins.notes}</div>}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedHandoverBooking(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}

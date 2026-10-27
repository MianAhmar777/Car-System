import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../contexts/NotificationContext';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import { formatPKR } from '../../utils/formatters';
import { Car, FileText, DollarSign, Shield, CheckCircle, Clock, CreditCard, ArrowRight } from 'lucide-react';

export default function BookingDetail() {
  const { id } = useParams();
  const { showToast } = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.success) setBooking(res.data);
    } catch (e) {
      showToast('Failed to load booking details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleProcessPayment = async () => {
    setPaying(true);
    try {
      const res = await api.post('/payments', {
        bookingId: id,
        amount: booking.totalAmount + booking.securityDeposit,
        provider: 'STRIPE_MOCK',
      });
      if (res.success) {
        showToast('Payment processed successfully!', 'success');
        fetchBooking();
      }
    } catch (err) {
      showToast(err.message || 'Payment processing failed.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleGenerateContract = async () => {
    try {
      const res = await api.post(`/contracts/generate/${id}`);
      if (res.success) {
        showToast('Contract generated successfully!', 'success');
        fetchBooking();
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate contract.', 'error');
    }
  };

  if (loading || !booking) {
    return <div className="p-10 text-center text-slate-500 font-semibold">Loading booking details...</div>;
  }

  const contract = booking.rentalContracts && booking.rentalContracts[0];

  return (
    <PublicLayout>
      <SEO title="Booking Details | DriveElite" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-mono">#{booking.bookingReference}</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800">
              {booking.status}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {booking.car?.make} {booking.car?.model} ({booking.car?.year})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pickup: {booking.pickupLocation?.name} | Return: {booking.returnLocation?.name}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium block">Total Reservation Amount</span>
          <span className="text-3xl font-extrabold text-slate-900">{formatPKR(booking.totalAmount)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Financial & Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Invoice Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Base Rental Rate ({booking.rentalDays} Days)</span>
                <span className="font-bold text-slate-900">{formatPKR(booking.basePrice)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Additional Services Fee</span>
                <span className="font-bold text-slate-900">{formatPKR(booking.servicesFee)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>Applied Discount</span>
                  <span className="font-bold">-{formatPKR(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Estimated Taxes (10%)</span>
                <span className="font-bold text-slate-900">{formatPKR(booking.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                <span className="text-slate-700">Refundable Security Deposit</span>
                <span className="font-bold text-slate-900">{formatPKR(booking.securityDeposit)}</span>
              </div>

              <div className="flex justify-between pt-3 text-sm font-bold">
                <span className="text-slate-900">Total Payable Amount</span>
                <span className="text-emerald-600">{formatPKR(booking.totalAmount + booking.securityDeposit)}</span>
              </div>
            </div>

            {booking.paymentStatus !== 'SUCCESS' && (
              <button
                onClick={handleProcessPayment}
                disabled={paying}
                className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> {paying ? 'Processing Payment...' : 'Pay Total Reservation Amount'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Contract & Release Status */}
        <div className="space-y-6">
          {/* Contract Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" /> Rental Contract Status
            </h3>

            {contract ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Contract #:</span>
                    <span className="font-bold text-slate-800 font-mono">{contract.contractNumber}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <span className="font-bold text-sky-600">{contract.status}</span>
                  </div>
                </div>

                <Link
                  to={`/customer/contracts/${contract.id}`}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Review & Sign Contract Online <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-3">No rental contract generated for this booking yet.</p>
                <button
                  onClick={handleGenerateContract}
                  className="w-full py-2.5 bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Generate Rental Contract Now
                </button>
              </div>
            )}
          </div>

          {/* Release Checklist Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Vehicle Release Status
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {booking.releaseAuthorization?.isAuthorized
                ? '✓ Vehicle Release Authorized! Proceed to rental location for pickup inspection.'
                : 'Vehicle release is pending checklist completion (Payment, Document verification, Contract approval).'}
            </p>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}

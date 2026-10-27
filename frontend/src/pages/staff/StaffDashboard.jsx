import React, { useState, useEffect } from 'react';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import api from '../../api/axios';
import { useNotification } from '../../contexts/NotificationContext';
import ReleaseChecklistModal from '../../components/ReleaseChecklistModal';
import { Car, FileCheck, Shield, CheckCircle, XCircle, AlertTriangle, Eye, ArrowRight } from 'lucide-react';

export default function StaffDashboard() {
  const { showToast } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [pendingContracts, setPendingContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeChecklistModal, setActiveChecklistModal] = useState(null);

  const fetchDashboardData = async (isInitial = false) => {
    try {
      const [bkRes, docRes, conRes] = await Promise.all([
        api.get('/bookings/all'),
        api.get('/documents/all?status=PENDING'),
        api.get('/contracts/all'),
      ]);
      if (bkRes.success) setBookings(bkRes.data);
      if (docRes.success) setPendingDocs(docRes.data);
      if (conRes.success) setPendingContracts(conRes.data.filter((c) => ['SIGNED_BY_CUSTOMER', 'UPLOADED_BY_CUSTOMER'].includes(c.status)));
    } catch (e) {
      if (isInitial) showToast('Failed to load operational portal data.', 'error');
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

  const handleVerifyDocument = async (docId, approved, reason = '') => {
    try {
      const res = await api.patch(`/documents/${docId}/verify`, { approved, rejectionReason: reason });
      if (res.success) {
        showToast(approved ? 'Document verified successfully!' : 'Document rejected.', 'success');
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

  const handleOpenReleaseChecklist = async (bookingId) => {
    try {
      const res = await api.get(`/vehicle-release/checklist/${bookingId}`);
      if (res.success) {
        setActiveChecklistModal({ bookingId, data: res.data });
      }
    } catch (err) {
      showToast(err.message || 'Failed to check release checklist.', 'error');
    }
  };

  return (
    <PublicLayout>
      <SEO title="Staff Operational Portal | DriveElite" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Operational Staff Portal</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Vehicle Handover & Document Review</h1>
        </div>
      </div>

      {/* Grid: Pending Document Verification & Contract Reviews */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Customer Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-sky-600" /> Pending Customer Documents</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">{pendingDocs.length}</span>
          </h3>

          {pendingDocs.length === 0 ? (
            <p className="text-xs text-slate-400">No pending document uploads.</p>
          ) : (
            <div className="space-y-3">
              {pendingDocs.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{doc.user?.fullName} ({doc.documentType})</span>
                    <span className="block text-slate-400 font-mono mt-0.5">{doc.fileName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-200 rounded-lg hover:bg-slate-300">
                        <Eye className="w-4 h-4 text-slate-700" />
                      </a>
                    )}
                    <button
                      onClick={() => handleVerifyDocument(doc.id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyDocument(doc.id, false, 'Illegible or expired document')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signed Contracts Awaiting Approval */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-600" /> Signed Contracts Awaiting Approval</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">{pendingContracts.length}</span>
          </h3>

          {pendingContracts.length === 0 ? (
            <p className="text-xs text-slate-400">No signed contracts pending review.</p>
          ) : (
            <div className="space-y-3">
              {pendingContracts.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{c.customer?.fullName}</span>
                    <span className="block text-slate-400 font-mono mt-0.5">#{c.contractNumber} ({c.status})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewContract(c.id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                    >
                      Verify & Approve
                    </button>
                    <button
                      onClick={() => handleReviewContract(c.id, false, 'Invalid signature or document checksum mismatch')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bookings & Vehicle Release Authorization Trigger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Reservations & Vehicle Handover Authorization</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Release Checklist & Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono font-bold text-slate-900">#{b.bookingReference}</td>
                  <td className="p-3 font-medium">{b.customer?.fullName}</td>
                  <td className="p-3 font-medium">{b.car?.make} {b.car?.model}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 font-bold text-[10px] rounded-full bg-slate-100 text-slate-800">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleOpenReleaseChecklist(b.id)}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Check Release Checklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Release Checklist Modal */}
      {activeChecklistModal && (
        <ReleaseChecklistModal
          bookingId={activeChecklistModal.bookingId}
          data={activeChecklistModal.data}
          onClose={() => setActiveChecklistModal(null)}
          onAuthorized={() => {
            showToast('Vehicle release authorized successfully!', 'success');
            setActiveChecklistModal(null);
            fetchDashboardData();
          }}
        />
      )}
      </div>
    </PublicLayout>
  );
}

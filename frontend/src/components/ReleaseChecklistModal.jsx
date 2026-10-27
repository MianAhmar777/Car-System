import React, { useState } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, FileCheck, Check, AlertTriangle, ClipboardCheck, Plus } from 'lucide-react';
import api from '../api/axios';

export default function ReleaseChecklistModal({ data, bookingId, onClose, onAuthorized }) {
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Quick Inspection Form State
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [mileage, setMileage] = useState('12000');
  const [fuelLevel, setFuelLevel] = useState('100');
  const [notes, setNotes] = useState('Verified clean vehicle physical condition & odometer reading at desk.');
  const [recordingInspection, setRecordingInspection] = useState(false);

  if (!data) return null;

  const { checklist, blockedReasons, isAuthorizedToRelease } = data;

  const items = [
    { label: 'Booking Status Confirmed', pass: checklist.bookingConfirmed },
    { label: 'Customer Identity Verified', pass: checklist.customerIdentified },
    { label: 'Driving License Verified', pass: checklist.drivingLicenseVerified },
    { label: 'Customer Documents Verified', pass: checklist.documentsVerified },
    { label: 'Rental Payment Received', pass: checklist.paymentVerified },
    { label: 'Security Deposit Paid', pass: checklist.securityDepositPaid },
    { label: 'Rental Contract Signed', pass: checklist.contractSigned },
    { label: 'Signed Contract Approved by Staff', pass: checklist.contractApproved },
    { label: 'Vehicle Available in Fleet', pass: checklist.vehicleAvailable },
    { label: 'Pre-Pickup Inspection Photo/Mileage Checked', pass: checklist.inspectionCompleted },
  ];

  const handleRecordInspection = async (e) => {
    e.preventDefault();
    setRecordingInspection(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/inspections', {
        bookingId,
        type: 'PICKUP',
        mileage: Number(mileage),
        fuelLevel: Number(fuelLevel),
        notes,
      });
      if (res.success) {
        setShowInspectionForm(false);
        // Refresh checklist data
        const refreshRes = await api.get(`/vehicle-release/checklist/${bookingId}`);
        if (refreshRes.success) {
          data.checklist = refreshRes.data.checklist;
          data.blockedReasons = refreshRes.data.blockedReasons;
          data.isAuthorizedToRelease = refreshRes.data.isAuthorizedToRelease;
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record inspection.');
    } finally {
      setRecordingInspection(false);
    }
  };

  const handleAuthorize = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.post(`/vehicle-release/authorize/${bookingId}`, {
        overrideReason: overrideReason || undefined,
      });
      if (res.success) {
        onAuthorized(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authorize vehicle release.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Vehicle Release Checklist</h3>
            <p className="text-xs text-slate-500 font-mono">Booking ID: {bookingId}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">
            ✕
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
            isAuthorizedToRelease ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}
        >
          {isAuthorizedToRelease ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className={`text-sm font-bold ${isAuthorizedToRelease ? 'text-emerald-900' : 'text-amber-900'}`}>
              {isAuthorizedToRelease ? 'RELEASE AUTHORIZED' : 'RELEASE BLOCKED'}
            </h4>
            <p className={`text-xs mt-0.5 ${isAuthorizedToRelease ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isAuthorizedToRelease
                ? 'All mandatory requirements have been satisfied. Staff can authorize immediate handover.'
                : 'Vehicle release cannot proceed until all prerequisite requirements pass or staff justification is provided.'}
            </p>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs font-medium">
              <span className="text-slate-700">{item.label}</span>
              {item.pass ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                  <Check className="w-3.5 h-3.5" /> Pass
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 font-bold bg-red-100/60 px-2 py-0.5 rounded">
                  <XCircle className="w-3.5 h-3.5" /> Incomplete
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Blocked Reasons if any */}
        {blockedReasons && blockedReasons.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
            <p className="text-xs font-bold text-red-900">Blocked Reasons:</p>
            <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
              {blockedReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            {/* Quick action button for inspection if missing */}
            {!checklist.inspectionCompleted && (
              <button
                type="button"
                onClick={() => setShowInspectionForm(!showInspectionForm)}
                className="mt-2 text-xs font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-lg border border-sky-200 flex items-center gap-1.5 transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                {showInspectionForm ? 'Hide Inspection Form' : 'Record Pre-Pickup Inspection Now'}
              </button>
            )}
          </div>
        )}

        {/* Inline Inspection Form */}
        {showInspectionForm && !checklist.inspectionCompleted && (
          <form onSubmit={handleRecordInspection} className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-sky-600" /> Record Pre-Pickup Vehicle Inspection
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Odometer Mileage (KM)</label>
                <input
                  required
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fuel Level (%)</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inspection Notes / Condition</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={recordingInspection}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              {recordingInspection ? 'Recording Inspection...' : 'Submit & Save Inspection (Mark Pass)'}
            </button>
          </form>
        )}

        {/* Override Reason Input */}
        {!isAuthorizedToRelease && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staff Override Reason (Required if authorizing incomplete checklist)
            </label>
            <textarea
              rows={2}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="State explicit authorization justification (e.g. Verified physically at desk)..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        )}

        {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
            Cancel
          </button>
          <button
            onClick={handleAuthorize}
            disabled={submitting || (!isAuthorizedToRelease && !overrideReason.trim())}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
              submitting || (!isAuthorizedToRelease && !overrideReason.trim())
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
            }`}
          >
            {submitting ? 'Processing...' : 'Authorize Vehicle Release'}
          </button>
        </div>
      </div>
    </div>
  );
}

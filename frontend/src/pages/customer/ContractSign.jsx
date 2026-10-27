import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../contexts/NotificationContext';
import SignaturePad from '../../components/SignaturePad';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import { FileText, Download, Upload, CheckCircle2, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ContractSign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signedFile, setSignedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchContract = async () => {
    try {
      const res = await api.get(`/contracts/${id}`);
      if (res.success) setContract(res.data);
    } catch (e) {
      showToast('Contract not found or access denied.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  const handleSaveSignature = async (signatureDataUrl) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/contracts/${id}/sign-online`, { signatureData: signatureDataUrl });
      if (res.success) {
        showToast('Contract electronically signed successfully!', 'success');
        setShowSignModal(false);
        fetchContract();
      }
    } catch (err) {
      showToast(err.message || 'Signature recording failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSignedFile = async (e) => {
    e.preventDefault();
    if (!signedFile) {
      showToast('Please select a signed PDF document file.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', signedFile);

      const res = await api.post(`/contracts/${id}/upload-signed`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        showToast('Signed contract uploaded successfully!', 'success');
        fetchContract();
      }
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !contract) {
    return <div className="p-10 text-center text-slate-500 font-semibold">Loading contract data...</div>;
  }

  const latestVersion = contract.versions && contract.versions[0];

  return (
    <PublicLayout>
      <SEO title="Rental Agreement Contract | DriveElite" noindex={true} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Navigation */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600">
        <ArrowLeft className="w-4 h-4" /> Back to Booking Details
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-mono">#{contract.contractNumber}</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800">
              Version v{latestVersion?.versionNumber || 1}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
              contract.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {contract.status}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Vehicle Rental Agreement</h1>
        </div>

        {/* Download PDF button */}
        {contract.pdfUrl && (
          <a
            href={contract.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-300"
          >
            <Download className="w-4 h-4" /> Download PDF Contract
          </a>
        )}
      </div>

      {/* Contract Viewer Document Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">AUTOMOTIVE RENTAL AGREEMENT</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Checksum SHA-256: <span className="font-semibold text-slate-700">{latestVersion?.checksum?.slice(0, 24) || 'Pending'}...</span>
          </p>
        </div>

        {/* Contract Content Text */}
        <div className="prose text-xs text-slate-700 leading-relaxed max-h-96 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="font-bold text-slate-900 mb-2">1. Booking Details & Financial Terms</h4>
          <p>Customer: {contract.booking?.customer?.fullName} ({contract.booking?.customer?.email})</p>
          <p>Vehicle: {contract.booking?.car?.make} {contract.booking?.car?.model} [Reg: {contract.booking?.car?.registrationNumber}]</p>
          <p>Rental Period: {new Date(contract.booking?.pickupDateTime).toLocaleDateString()} to {new Date(contract.booking?.returnDateTime).toLocaleDateString()}</p>
          <p>Total Total Amount: ${contract.booking?.totalAmount} | Security Deposit: ${contract.booking?.securityDeposit}</p>

          <h4 className="font-bold text-slate-900 mt-4 mb-2">2. Mandatory Terms & Conditions</h4>
          <p>{latestVersion?.contentSnapshot}</p>
        </div>

        {/* Signature Status Area */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Signature Status</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {contract.signatures?.length > 0
                ? `Signed by ${contract.signatures[0].user?.fullName} on ${new Date(contract.signatures[0].signedAt).toLocaleString()}`
                : 'Contract requires customer signature before vehicle release.'}
            </p>
          </div>

          {contract.status === 'PENDING_SIGNATURE' || contract.status === 'GENERATED' || contract.status === 'REJECTED' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSignModal(true)}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Sign Online (E-Signature)
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100/70 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> Signature Recorded & Locked
            </span>
          )}
        </div>
      </div>

      {/* Offline Upload Section */}
      {(contract.status === 'PENDING_SIGNATURE' || contract.status === 'GENERATED' || contract.status === 'REJECTED') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-600" /> Alternative: Upload Signed PDF Document
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            If you prefer to download, print, sign offline, and scan, upload your signed PDF file below.
          </p>

          <form onSubmit={handleUploadSignedFile} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSignedFile(e.target.files[0])}
              className="text-xs p-2 border border-slate-200 rounded-xl w-full sm:w-auto"
            />
            <button
              type="submit"
              disabled={submitting || !signedFile}
              className={`px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-all ${
                submitting || !signedFile ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-sky-600 shadow-sm'
              }`}
            >
              {submitting ? 'Uploading...' : 'Submit Signed PDF'}
            </button>
          </form>
        </div>
      )}

      {/* Modal for In-App E-Signature Canvas */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Sign Rental Contract Online</h3>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              By drawing your signature below, you explicitly agree to all terms and conditions outlined in Contract #{contract.contractNumber} v{latestVersion?.versionNumber}.
            </p>

            <SignaturePad onSave={handleSaveSignature} />
          </div>
        </div>
      )}
      </div>
    </PublicLayout>
  );
}

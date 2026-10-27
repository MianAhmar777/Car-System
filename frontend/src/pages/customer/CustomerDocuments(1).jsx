import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNotification } from '../../contexts/NotificationContext';
import SEO from '../../seo/SEO';
import PublicLayout from '../../components/layout/PublicLayout';
import { Upload, FileCheck, XCircle, Clock, ShieldAlert } from 'lucide-react';

export default function CustomerDocuments() {
  const { showToast } = useNotification();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState('DRIVING_LICENSE');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async (isInitial = false) => {
    try {
      const res = await api.get('/documents/my-documents');
      if (res.success) setDocuments(res.data);
    } catch (e) {
      if (isInitial) showToast('Failed to load documents.', 'error');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(true);

    const intervalId = setInterval(() => {
      fetchDocuments(false);
    }, 3000);

    const handleFocus = () => fetchDocuments(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file to upload.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', docType);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        showToast('Document uploaded successfully! Awaiting staff verification.', 'success');
        setSelectedFile(null);
        fetchDocuments();
      }
    } catch (err) {
      showToast(err.message || 'Document upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <PublicLayout>
      <SEO title="Rental Document Verification | DriveElite" noindex={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Rental Documents</h1>
        <p className="text-sm text-slate-500 font-medium">Upload required CNIC, Passport, and Driving License for vehicle release verification.</p>
      </div>

      {/* Upload Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-sky-600" /> Upload New Document
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              <option value="DRIVING_LICENSE">Driving License</option>
              <option value="CNIC">National ID / CNIC</option>
              <option value="PASSPORT">Passport</option>
              <option value="PROOF_OF_ADDRESS">Proof of Address</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select File (PDF, JPG, PNG - Max 10MB)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all ${
              uploading || !selectedFile ? 'bg-slate-300 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/30'
            }`}
          >
            {uploading ? 'Uploading to Private Storage...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Uploaded Documents Status</h3>

        {loading ? (
          <div className="text-xs text-slate-500 font-medium">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-xs text-slate-400">No documents uploaded yet.</div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{doc.documentType}</span>
                  <span className="block text-slate-400 text-[11px] font-mono mt-0.5">{doc.fileName}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    doc.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.verificationStatus === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.verificationStatus}
                  </span>

                  {doc.signedUrl && (
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-600 font-bold hover:underline"
                    >
                      View Private File
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </PublicLayout>
  );
}

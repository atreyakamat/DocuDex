import { X, Download, Share2, Star, FileText, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Document } from '@docudex/shared-types';
import { documentsApi } from '../../services/api';
import { toast } from '../../store/toastStore';

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onShare?: (doc: Document) => void;
  onStarToggle?: (doc: Document) => void;
}

const TYPE_LABELS: Record<string, string> = {
  PAN_CARD: 'PAN Card', AADHAAR_CARD: 'Aadhaar Card', PASSPORT: 'Passport',
  DRIVING_LICENSE: 'Driving License', VOTER_ID: 'Voter ID',
  BANK_STATEMENT: 'Bank Statement', SALARY_SLIP: 'Salary Slip', ITR: 'ITR',
  GST_RETURN: 'GST Return', DEGREE_CERTIFICATE: 'Degree Certificate',
  MARK_SHEET: 'Mark Sheet', SALE_DEED: 'Sale Deed',
  PROPERTY_TAX_RECEIPT: 'Property Tax Receipt',
  INCORPORATION_CERTIFICATE: 'Incorporation Certificate',
  GST_REGISTRATION: 'GST Registration', ELECTRICITY_BILL: 'Electricity Bill',
  WATER_BILL: 'Water Bill', OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  CURRENT: 'bg-green-100 text-green-800',
  EXPIRING_SOON: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
};

export default function DocumentViewer({ document: doc, onClose, onShare, onStarToggle }: DocumentViewerProps) {
  const [scale, setScale] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const isImage = doc.mimeType.startsWith('image/');
  const isPdf = doc.mimeType === 'application/pdf';

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await documentsApi.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = Object.assign(window.document.createElement('a'), {
        href: url,
        download: doc.originalName,
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  }

  const fields = doc.metadata.extractedFields ?? {};
  const hasExtracted = Object.keys(fields).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{doc.originalName}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {doc.metadata.documentType && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {TYPE_LABELS[doc.metadata.documentType] ?? doc.metadata.documentType}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[doc.status]}`}>
                {doc.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            {onStarToggle && (
              <button
                onClick={() => onStarToggle(doc)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={doc.isStarred ? 'Unstar' : 'Star'}
              >
                <Star className={`w-5 h-5 ${doc.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(doc)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Download"
            >
              <Download className={`w-5 h-5 ${downloading ? 'text-gray-300' : 'text-gray-500'}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview pane */}
          <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center relative">
            {(isImage || isPdf) ? (
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
                {isImage ? (
                  <img
                    src={`/api/documents/${doc.id}/download`}
                    alt={doc.originalName}
                    className="max-w-full max-h-[60vh] rounded shadow"
                  />
                ) : (
                  <iframe
                    src={`/api/documents/${doc.id}/download`}
                    title={doc.originalName}
                    className="w-[600px] h-[70vh] rounded shadow"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-16">
                <FileText className="w-16 h-16" />
                <p className="text-sm">Preview not available for this file type</p>
                <button
                  onClick={handleDownload}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Download to view
                </button>
              </div>
            )}
            {/* Zoom controls */}
            {(isImage || isPdf) && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white rounded-lg shadow border border-gray-200 p-1">
                <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} className="p-1 hover:bg-gray-100 rounded">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 px-1 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} className="p-1 hover:bg-gray-100 rounded">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Metadata panel */}
          <div className="w-72 border-l border-gray-200 overflow-y-auto p-4 bg-white flex flex-col gap-4 text-sm">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">File Info</h3>
              <dl className="space-y-1 text-gray-600">
                <div className="flex justify-between"><dt>Size</dt><dd>{(doc.fileSize / 1024).toFixed(1)} KB</dd></div>
                <div className="flex justify-between"><dt>Type</dt><dd className="capitalize">{doc.mimeType.split('/')[1]}</dd></div>
                <div className="flex justify-between"><dt>Uploaded</dt><dd>{new Date(doc.createdAt).toLocaleDateString()}</dd></div>
              </dl>
            </section>

            {doc.metadata.summary && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  AI Summary
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-purple-50 rounded-lg p-3 border border-purple-100">
                  {doc.metadata.summary.replace(/\*\*/g, '')}
                </p>
              </section>
            )}

            {doc.metadata.holderName && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Document Details</h3>
                <dl className="space-y-1 text-gray-600">
                  {doc.metadata.holderName && <div><dt className="text-gray-400 text-xs">Holder</dt><dd>{doc.metadata.holderName}</dd></div>}
                  {doc.metadata.documentNumber && <div><dt className="text-gray-400 text-xs">Number</dt><dd className="font-mono text-xs">{doc.metadata.documentNumber}</dd></div>}
                  {doc.metadata.issueDate && <div><dt className="text-gray-400 text-xs">Issued</dt><dd>{doc.metadata.issueDate}</dd></div>}
                  {doc.metadata.expiryDate && <div><dt className="text-gray-400 text-xs">Expires</dt><dd className={doc.status === 'EXPIRED' ? 'text-red-600 font-medium' : ''}>{doc.metadata.expiryDate}</dd></div>}
                  {doc.metadata.issuingAuthority && <div><dt className="text-gray-400 text-xs">Issued by</dt><dd>{doc.metadata.issuingAuthority}</dd></div>}
                </dl>
              </section>
            )}

            {hasExtracted && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Extracted Fields</h3>
                <dl className="space-y-1 text-gray-600">
                  {Object.entries(fields).slice(0, 10).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-gray-400 text-xs capitalize">{k.replace(/_/g, ' ')}</dt>
                      <dd className="text-xs">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {doc.metadata.tags && doc.metadata.tags.length > 0 && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {doc.metadata.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </section>
            )}

            {doc.metadata.classificationConfidence !== undefined && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">AI Confidence</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${doc.metadata.classificationConfidence >= 0.85 ? 'bg-green-500' : doc.metadata.classificationConfidence >= 0.7 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.round(doc.metadata.classificationConfidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{Math.round(doc.metadata.classificationConfidence * 100)}%</span>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

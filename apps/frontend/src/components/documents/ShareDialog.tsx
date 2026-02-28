import { useState } from 'react';
import { X, Copy, Check, Link2, Trash2 } from 'lucide-react';
import type { Document } from '@docudex/shared-types';
import { documentsApi } from '../../services/api';
import { toast } from '../../store/toastStore';

interface ShareDialogProps {
  document: Document;
  onClose: () => void;
}

const EXPIRY_OPTIONS = [
  { label: '1 hour',   value: 1 },
  { label: '24 hours', value: 24 },
  { label: '3 days',   value: 72 },
  { label: '7 days',   value: 168 },
  { label: '30 days',  value: 720 },
];

interface ShareLink {
  shareUrl: string;
  token: string;
  expiresAt: string;
}

export default function ShareDialog({ document: doc, onClose }: ShareDialogProps) {
  const [hours, setHours] = useState(72);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);

  async function generateLink() {
    setLoading(true);
    try {
      const res = await documentsApi.createShare(doc.id, { expiresInHours: hours, recipientEmail: email || undefined });
      setLink(res);
      toast.success('Share link created');
    } catch {
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Copied to clipboard');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Share Document</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Document name */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Sharing: <span className="font-medium text-gray-900">{doc.originalName}</span></p>
          </div>

          {/* Options */}
          {!link && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link expires after</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EXPIRY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={generateLink}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                {loading ? 'Generating…' : 'Generate Share Link'}
              </button>
            </>
          )}

          {/* Generated link */}
          {link && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <span className="flex-1 text-sm text-gray-700 truncate font-mono">{link.shareUrl}</span>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Expires: {new Date(link.expiresAt).toLocaleString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setLink(null)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg px-3 py-2"
                >
                  <Trash2 className="w-4 h-4" />
                  New link
                </button>
                <button
                  onClick={copyLink}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

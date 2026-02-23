import { cn } from '@/utils/cn';
import {
  FileText,
  Image,
  FileSpreadsheet,
  Star,
  MoreVertical,
  Download,
  Trash2,
} from 'lucide-react';
import { formatDate, formatFileSize, formatDocumentType } from '@/utils/format';
import type { Document } from '@docudex/shared-types';

const STATUS_STYLES: Record<string, string> = {
  CURRENT: 'bg-green-100 text-green-700',
  EXPIRING_SOON: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
};

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  return <FileText className="h-8 w-8 text-gray-400" />;
}

interface Props {
  document: Document;
  onStar?: (id: string, starred: boolean) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export default function DocumentCard({ document, onStar, onDelete, onDownload }: Props) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <FileIcon mimeType={document.mimeType} />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onStar?.(document.id, !document.isStarred)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Star
              className={cn(
                'h-4 w-4',
                document.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
              )}
            />
          </button>
          <button
            onClick={() => onDownload?.(document.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Download className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
          <button
            onClick={() => onDelete?.(document.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm font-medium text-gray-900 truncate mb-1" title={document.originalName}>
        {document.originalName}
      </p>

      {document.metadata.documentType && (
        <p className="text-xs text-gray-500 mb-2">
          {formatDocumentType(document.metadata.documentType)}
        </p>
      )}

      {/* Status badge */}
      <div className="flex items-center justify-between mt-3">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            STATUS_STYLES[document.status] || STATUS_STYLES.PROCESSING
          )}
        >
          {document.status.replace('_', ' ')}
        </span>
        <span className="text-xs text-gray-400">{formatFileSize(document.fileSize)}</span>
      </div>

      {/* Expiry */}
      {document.metadata.expiryDate && (
        <p className="text-xs text-gray-500 mt-2">
          Expires: {formatDate(document.metadata.expiryDate)}
        </p>
      )}

      {/* Upload date */}
      <p className="text-xs text-gray-400 mt-1">{formatDate(document.createdAt)}</p>
    </div>
  );
}

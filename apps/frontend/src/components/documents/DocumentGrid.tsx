import DocumentCard from './DocumentCard';
import type { Document } from '@docudex/shared-types';
import { FileText } from 'lucide-react';

interface Props {
  documents: Document[];
  onView?: (doc: Document) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (doc: Document) => void;
  onStar?: (doc: Document) => void;
}

export default function DocumentGrid({ documents, onView, onDelete, onDownload, onShare, onStar }: Props) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-xl font-medium text-gray-500">No documents found</p>
        <p className="text-sm text-gray-400 mt-1">Upload a document to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onView={onView}
          onDelete={onDelete}
          onDownload={onDownload}
          onShare={onShare}
          onStar={onStar}
        />
      ))}
    </div>
  );
}

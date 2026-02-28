import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Filter, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { documentsApi } from '@/services/api';
import DocumentGrid from '@/components/documents/DocumentGrid';
import UploadZone from '@/components/documents/UploadZone';
import DocumentViewer from '@/components/documents/DocumentViewer';
import ShareDialog from '@/components/documents/ShareDialog';
import { toast } from '@/store/toastStore';
import { DocumentCardSkeleton } from '@/components/ui/Skeleton';
import { NoDocuments, NoSearchResults } from '@/components/ui/EmptyStates';
import type { Document } from '@docudex/shared-types';

const CATEGORIES = ['ALL', 'IDENTITY', 'FINANCIAL', 'EDUCATIONAL', 'PROPERTY', 'BUSINESS', 'UTILITY', 'OTHER'];
const STATUSES = ['ALL', 'PROCESSING', 'CURRENT', 'EXPIRING_SOON', 'EXPIRED'];

export default function Documents() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);

  // Sync search param from header search
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) { setSearch(q); setSearchParams({}, { replace: true }); }
  }, [searchParams, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search, category, status],
    queryFn: () =>
      documentsApi.list({
        query: search || undefined,
        category: category === 'ALL' ? undefined : category,
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    },
    onError: () => toast.error('Failed to delete document'),
  });

  const starMutation = useMutation({
    mutationFn: ({ id, isStarred }: { id: string; isStarred: boolean }) =>
      documentsApi.star(id, isStarred),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success(vars.isStarred ? 'Added to starred' : 'Removed from starred');
      // Update viewer if open
      if (viewingDoc?.id === vars.id) {
        setViewingDoc((d) => d ? { ...d, isStarred: vars.isStarred } : d);
      }
    },
  });

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentsApi.download(doc.id);
      const url = URL.createObjectURL(blob);
      Object.assign(window.document.createElement('a'), { href: url, download: doc.originalName }).click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  const documents: Document[] = data?.data?.documents ?? data?.documents ?? [];
  const total: number = data?.data?.total ?? data?.total ?? 0;
  const hasFilters = search || category !== 'ALL' || status !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">{total} document{total !== 1 ? 's' : ''} total</p>
        </div>
        <button data-tour="upload-zone" className="btn-primary" onClick={() => setShowUpload((v) => !v)}>
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div data-tour="upload-zone" className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Upload Documents</h3>
            <button onClick={() => setShowUpload(false)}>
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <UploadZone
            onUploadComplete={() => {
              setShowUpload(false);
              qc.invalidateQueries({ queryKey: ['documents'] });
              qc.invalidateQueries({ queryKey: ['document-stats'] });
              toast.success('Document uploaded successfully');
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="input py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
          </select>
        </div>
        <select className="input py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
        </select>
        {hasFilters && (
          <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => { setSearch(''); setCategory('ALL'); setStatus('ALL'); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <DocumentCardSkeleton key={i} />)}
        </div>
      ) : documents.length === 0 ? (
        hasFilters ? <NoSearchResults /> : <NoDocuments onUpload={() => setShowUpload(true)} />
      ) : (
        <div data-tour="document-grid">
        <DocumentGrid
          documents={documents}
          onView={(doc) => setViewingDoc(doc)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onDownload={(id) => { const doc = documents.find((d) => d.id === id); if (doc) handleDownload(doc); }}
          onShare={(doc) => setSharingDoc(doc)}
          onStar={(doc) => starMutation.mutate({ id: doc.id, isStarred: !doc.isStarred })}
        />
        </div>
      )}

      {/* Document viewer modal */}
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
          onShare={(doc) => { setViewingDoc(null); setSharingDoc(doc); }}
          onStarToggle={(doc) => starMutation.mutate({ id: doc.id, isStarred: !doc.isStarred })}
        />
      )}

      {/* Share dialog */}
      {sharingDoc && (
        <ShareDialog
          document={sharingDoc}
          onClose={() => setSharingDoc(null)}
        />
      )}
    </div>
  );
}


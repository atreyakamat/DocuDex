import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, Filter, Loader2, X } from 'lucide-react';
import { documentsApi } from '@/services/api';
import DocumentGrid from '@/components/documents/DocumentGrid';
import UploadZone from '@/components/documents/UploadZone';

const CATEGORIES = ['ALL', 'ID', 'FINANCIAL', 'LEGAL', 'EDUCATIONAL', 'PROPERTY', 'MEDICAL', 'OTHER'];
const STATUSES = ['ALL', 'PROCESSING', 'CURRENT', 'EXPIRING_SOON', 'EXPIRED'];

export default function Documents() {
  const qc = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search, category, status],
    queryFn: () =>
      documentsApi.list({
        search: search || undefined,
        category: category === 'ALL' ? undefined : category,
        status: status === 'ALL' ? undefined : status,
        limit: 50,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const handleDownload = async (id: string) => {
    const response = await documentsApi.download(id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${id}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const documents = data?.data?.documents ?? [];
  const hasFilters = search || category !== 'ALL' || status !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            {data?.data?.total ?? 0} document{data?.data?.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowUpload((v) => !v)}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div className="card">
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
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3">
        {/* Search */}
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

        {/* Category */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="input py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <select
          className="input py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => { setSearch(''); setCategory('ALL'); setStatus('ALL'); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          onDelete={(id) => deleteMutation.mutate(id)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

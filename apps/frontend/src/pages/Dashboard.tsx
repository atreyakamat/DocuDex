import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { documentsApi } from '@/services/api';
import { formatRelative, getExpiryStatusColor, daysUntilExpiry, formatDocumentType } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import type { Document } from '@docudex/shared-types';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['document-stats'],
    queryFn: () => documentsApi.getStats(),
    refetchInterval: 60_000,
  });

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: () => documentsApi.list({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' }),
  });

  const { data: expiringData } = useQuery({
    queryKey: ['expiring-documents'],
    queryFn: () => documentsApi.list({ status: 'EXPIRING_SOON', limit: 5 }),
  });

  const stats = statsData?.data;
  const recentDocs: Document[] = recentData?.data?.documents ?? [];
  const expiringDocs: Document[] = expiringData?.data?.documents ?? [];

  const statCards = [
    {
      label: 'Total Documents',
      value: stats?.total ?? 0,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Valid',
      value: stats?.valid ?? 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Expiring Soon',
      value: stats?.expiring_soon ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Expired',
      value: stats?.expired ?? 0,
      icon: Clock,
      color: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your document repository.</p>
      </div>

      {/* Stat cards */}
      <div data-tour="stats-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              )}
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent documents */}
        <div data-tour="recent-docs" className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Documents</h2>
            <Link to="/documents" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {recentLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : recentDocs.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No documents yet.</p>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <FileText className="h-8 w-8 text-primary-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {doc.metadata?.documentType ? formatDocumentType(doc.metadata.documentType) : 'Document'} · {formatRelative(doc.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      doc.status === 'CURRENT'
                        ? 'bg-green-100 text-green-700'
                        : doc.status === 'EXPIRED'
                        ? 'bg-red-100 text-red-700'
                        : doc.status === 'EXPIRING_SOON'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {doc.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry alerts */}
        <div data-tour="expiry-alerts" className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Expiry Alerts</h2>
          </div>
          {expiringDocs.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No documents expiring soon. 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {expiringDocs.map((doc) => {
                const expiry = doc.metadata?.expiryDate;
                const days = expiry ? daysUntilExpiry(expiry) : null;
                return (
                  <div key={doc.id} className="flex items-start gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        days !== null && days <= 7
                          ? 'text-red-500'
                          : 'text-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-tight truncate max-w-[180px]">
                        {doc.originalName}
                      </p>
                      <p
                        className={`text-xs ${getExpiryStatusColor(expiry)}`}
                      >
                        {days !== null
                          ? days <= 0
                            ? 'Expired'
                            : `Expires in ${days} day${days === 1 ? '' : 's'}`
                          : 'No expiry'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

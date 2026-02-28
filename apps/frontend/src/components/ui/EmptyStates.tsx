/**
 * Reusable empty-state components for DocuDex pages.
 * Show these when there are zero results / no data.
 */

import { FileText, Upload, GitBranch, Bell, Search, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; to?: string; onClick?: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        {icon ?? <FolderOpen className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="btn-primary text-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary text-sm">
            {action.label}
          </button>
        ))}
    </div>
  );
}

/* ─── Pre-built variants ─── */

export function NoDocuments({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-blue-400" />}
      title="No documents yet"
      description="Upload your first document and our AI will automatically classify, extract key data, and generate a summary for you."
      action={{ label: 'Upload Document', onClick: onUpload }}
    />
  );
}

export function NoSearchResults() {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-400" />}
      title="No results found"
      description="Try adjusting your search terms or clearing filters to see more documents."
    />
  );
}

export function NoWorkflows() {
  return (
    <EmptyState
      icon={<GitBranch className="w-8 h-8 text-green-400" />}
      title="No active workflows"
      description="Start a workflow to get a step-by-step checklist of all the documents you need for a specific process."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8 text-yellow-400" />}
      title="All caught up!"
      description="You have no notifications right now. We'll let you know when something needs your attention."
    />
  );
}

export function NoExpiringDocs() {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3">
        <span className="text-2xl">🎉</span>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-0.5">All clear!</p>
      <p className="text-xs text-gray-500">No documents expiring soon.</p>
    </div>
  );
}

export function NoRecentDocs() {
  return (
    <EmptyState
      icon={<Upload className="w-8 h-8 text-primary-400" />}
      title="No recent documents"
      description="Upload your first document to get started with AI-powered document management."
      action={{ label: 'Go to Documents', to: '/documents' }}
    />
  );
}

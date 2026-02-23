import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), new Date());
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getExpiryStatusColor(expiryDate?: string): string {
  if (!expiryDate) return 'text-gray-500';
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return 'text-red-600';
  if (days <= 30) return 'text-red-500';
  if (days <= 90) return 'text-yellow-500';
  return 'text-green-600';
}

export function formatDocumentType(type?: string): string {
  if (!type) return 'Unknown';
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

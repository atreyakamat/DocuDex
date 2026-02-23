import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/documents': 'Documents',
  '/workflows': 'Workflows',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'DocuDex';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-64
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}

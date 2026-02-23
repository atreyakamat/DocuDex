import { Link } from 'react-router-dom';
import { FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
      <FileSearch className="h-20 w-20 text-gray-300 mb-6" />
      <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-1">Page not found</p>
      <p className="text-gray-400 mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}

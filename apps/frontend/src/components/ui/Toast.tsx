import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, ToastType } from '../../store/toastStore';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  error:   <XCircle    className="w-5 h-5 text-red-500 flex-shrink-0" />,
  info:    <Info       className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
};

const borders: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  info:    'border-l-blue-500',
  warning: 'border-l-yellow-400',
};

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 bg-white border border-gray-200 border-l-4 ${borders[t.type]} rounded-lg shadow-lg p-4 animate-slide-in`}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm text-gray-800">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

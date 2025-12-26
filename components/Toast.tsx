import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styles = {
    success: 'bg-brand-ivory border-brand-accent/20 text-brand-ink shadow-2xl shadow-brand-accent/5',
    error: 'bg-brand-ivory border-red-500/20 text-brand-ink shadow-2xl shadow-red-500/5',
    info: 'bg-brand-ink border-brand-accent text-brand-ivory shadow-2xl shadow-brand-ink/20'
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-brand-accent" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <AlertCircle className="w-4 h-4 text-brand-accent" />
  };

  return (
    <div className={`flex items-center p-5 mb-4 border rounded-sm max-w-sm w-full animate-slide-in-right ${styles[toast.type]}`}>
      <div className="flex-shrink-0 mr-4">
        {icons[toast.type]}
      </div>
      <div className="flex-1 text-[10px] uppercase tracking-widest font-bold display-font">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 flex-shrink-0 opacity-20 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
};
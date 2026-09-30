import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../store/toastStore';
import { cn } from '../../utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className={cn(
              'pointer-events-auto flex items-center gap-3 p-3 pl-4 rounded-xl shadow-2xl glass border-white/10',
              toast.type === 'error' && 'border-red-500/50',
              toast.type === 'success' && 'border-[var(--color-accent)]/50'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-[var(--color-accent)] shrink-0" />}
            {toast.type === 'error' && <XCircle size={18} className="text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}
            
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

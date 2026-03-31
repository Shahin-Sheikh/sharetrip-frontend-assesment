import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      className="state-container state-container--error"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle size={40} color="var(--error)" />
      <h2 className="state-container__title">Something went wrong</h2>
      <p className="state-container__text">{message}</p>
      <button className="btn-primary state-container__retry-btn" onClick={onRetry}>
        <RefreshCw size={16} />
        <span>Try Again</span>
      </button>
    </motion.div>
  );
}

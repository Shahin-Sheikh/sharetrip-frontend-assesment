import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  isRetrying: boolean;
  retryCount: number;
}

export function LoadingState({ isRetrying, retryCount }: LoadingStateProps) {
  return (
    <motion.div
      className="state-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={40}
        color="var(--primary)"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {isRetrying ? (
        <>
          <h2 className="state-container__title">Retrying... (Attempt {retryCount}/3)</h2>
          <p className="state-container__text">
            The server is being unreliable. Hang tight, we're trying again.
          </p>
        </>
      ) : (
        <>
          <h2 className="state-container__title">Loading products...</h2>
          <p className="state-container__text">
            Fetching the latest catalog for you.
          </p>
        </>
      )}
    </motion.div>
  );
}

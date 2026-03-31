import { PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  search?: string;
  category?: string;
}

export function EmptyState({ search, category }: EmptyStateProps) {
  const hasFilters = search || category;

  return (
    <motion.div
      className="state-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PackageOpen size={48} color="var(--text-muted)" />
      <h2 className="state-container__title">No products found</h2>
      <p className="state-container__text">
        {hasFilters
          ? `No products match your current filters. Try adjusting your search${category ? ' or category' : ''}.`
          : 'There are no products available at the moment.'}
      </p>
    </motion.div>
  );
}

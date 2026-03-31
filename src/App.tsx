import { useState, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useProducts } from './hooks/useProducts';
import { useDebounce } from './hooks/useDebounce';
import { ProductGrid } from './components/ProductGrid';
import { Pagination } from './components/Pagination';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import type { FetchProductsParams } from './types/product';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'home', label: 'Home' },
  { value: 'outdoors', label: 'Outdoors' },
];

function App() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const params: FetchProductsParams = useMemo(
    () => ({
      page,
      limit: 12,
      category: category || undefined,
      search: debouncedSearch || undefined,
    }),
    [page, category, debouncedSearch]
  );

  const { data: products, total, totalPages, isLoading, isRetrying, retryCount, error, retry } =
    useProducts(params);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const showEmptyState = !isLoading && !error && products.length === 0;
  const showGrid = !isLoading && !error && products.length > 0;

  return (
    <div className="app">
      {/* Header */}
      <header className="glass-panel app__header">
        <div className="app__header-content">
          <div>
            <h1 className="app__title">Premium Products</h1>
            <p className="app__subtitle">
              Browse our collection of {total > 0 ? total : ''} curated products
            </p>
          </div>
          {isRetrying && (
            <div className="app__retry-badge" role="status" aria-live="polite">
              <span className="app__retry-dot" />
              Reconnecting... ({retryCount}/3)
            </div>
          )}
        </div>
      </header>

      {/* Controls */}
      <section className="app__controls" aria-label="Product filters">
        <div className="app__search glass-panel">
          <Search size={20} color="var(--text-muted)" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="app__search-input"
            aria-label="Search products"
          />
        </div>

        <div className="app__filter-group">
          <SlidersHorizontal size={18} color="var(--text-muted)" className="app__filter-icon" />
          <select
            className="glass-panel app__category-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} style={{ background: 'var(--surface)' }}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Main Content */}
      <main className="app__main">
        <AnimatePresence mode="wait">
          {(isLoading && !isRetrying) && (
            <LoadingState key="loading" isRetrying={false} retryCount={0} />
          )}

          {isRetrying && products.length === 0 && (
            <LoadingState key="retrying" isRetrying retryCount={retryCount} />
          )}

          {error && (
            <ErrorState key="error" message={error} onRetry={retry} />
          )}

          {showEmptyState && (
            <EmptyState key="empty" search={debouncedSearch} category={category} />
          )}

          {showGrid && (
            <div key="grid">
              <ProductGrid products={products} />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading || isRetrying}
              />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

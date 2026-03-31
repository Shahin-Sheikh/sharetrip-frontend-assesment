import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { Product, PaginatedResponse, FetchProductsParams } from '../types/product';

interface UseProductsState {
  data: Product[];
  total: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  isRetrying: boolean;
  error: string | null;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Simple in-memory cache
const cache = new Map<string, { data: PaginatedResponse<Product>; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

function getCacheKey(params: FetchProductsParams): string {
  return JSON.stringify(params);
}

export function useProducts(params: FetchProductsParams) {
  const [state, setState] = useState<UseProductsState>({
    data: [],
    total: 0,
    totalPages: 0,
    page: params.page ?? 1,
    isLoading: true,
    isRetrying: false,
    error: null,
    retryCount: 0,
  });

  const abortRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchWithRetry = useCallback(async (fetchParams: FetchProductsParams, attempt = 0) => {
    if (abortRef.current) return;

    const cacheKey = getCacheKey(fetchParams);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState(prev => ({
        ...prev,
        data: cached.data.data,
        total: cached.data.total,
        totalPages: cached.data.totalPages,
        page: cached.data.page,
        isLoading: false,
        isRetrying: false,
        error: null,
        retryCount: 0,
      }));
      return;
    }

    if (attempt === 0) {
      setState(prev => ({ ...prev, isLoading: true, error: null, retryCount: 0 }));
    } else {
      setState(prev => ({ ...prev, isRetrying: true, retryCount: attempt }));
    }

    try {
      const result = await api.fetchProducts(fetchParams);
      if (abortRef.current) return;

      cache.set(cacheKey, { data: result, timestamp: Date.now() });

      setState({
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
        page: result.page,
        isLoading: false,
        isRetrying: false,
        error: null,
        retryCount: 0,
      });
    } catch (err) {
      if (abortRef.current) return;

      if (attempt < MAX_RETRIES) {
        setState(prev => ({
          ...prev,
          isRetrying: true,
          retryCount: attempt + 1,
          error: null,
        }));
        retryTimeoutRef.current = setTimeout(() => {
          fetchWithRetry(fetchParams, attempt + 1);
        }, RETRY_DELAYS[attempt]);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRetrying: false,
          error: err instanceof Error ? err.message : 'An unexpected error occurred',
          retryCount: attempt,
        }));
      }
    }
  }, []);

  useEffect(() => {
    abortRef.current = false;
    fetchWithRetry(params);

    return () => {
      abortRef.current = true;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [params, fetchWithRetry]);

  const retry = useCallback(() => {
    abortRef.current = false;
    fetchWithRetry(params);
  }, [params, fetchWithRetry]);

  return { ...state, retry };
}

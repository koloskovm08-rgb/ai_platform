import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseCacheOptions {
  staleTime?: number; // Время в мс, после которого данные считаются устаревшими
  cacheTime?: number; // Время в мс, после которого данные удаляются из кэша
}

const cache = new Map<string, CacheEntry<unknown>>();

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const { staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Используем ref для staleTime и cacheTime, чтобы избежать лишних пересозданий fetchData
  const staleTimeRef = useRef(staleTime);
  const cacheTimeRef = useRef(cacheTime);
  
  useEffect(() => {
    staleTimeRef.current = staleTime;
    cacheTimeRef.current = cacheTime;
  }, [staleTime, cacheTime]);

  const fetchData = useCallback(async (force = false) => {
    const cached = cache.get(key);
    const now = Date.now();

    // Проверяем кэш
    if (!force && cached && (now - cached.timestamp) < staleTimeRef.current) {
      setData(cached.data as T);
      setIsLoading(false);
      return cached.data as T;
    }

    // Показываем индикатор валидации, если есть закэшированные данные
    if (cached) {
      setData(cached.data as T);
      setIsLoading(false);
      setIsValidating(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetcherRef.current();
      cache.set(key, { data: result, timestamp: now });
      setData(result);
      setError(null);

      // Планируем удаление из кэша
      setTimeout(() => {
        const entry = cache.get(key);
        if (entry && (Date.now() - entry.timestamp) >= cacheTimeRef.current) {
          cache.delete(key);
        }
      }, cacheTimeRef.current);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [key]);

  const mutate = useCallback(async (updater?: (data: T | null) => T | Promise<T>) => {
    if (updater) {
      const newData = await updater(data);
      cache.set(key, { data: newData, timestamp: Date.now() });
      setData(newData);
    } else {
      await fetchData(true);
    }
  }, [data, key, fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    fetchData(true);
  }, [key, fetchData]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // fetchData пересоздаётся только при изменении key

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    invalidate,
    refetch: () => fetchData(true),
  };
}


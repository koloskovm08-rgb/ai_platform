import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.8,
}: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold,
    };

    observer.current = new IntersectionObserver(handleObserver, options);
    const currentSentinel = sentinelRef.current;

    if (currentSentinel) {
      observer.current.observe(currentSentinel);
    }

    return () => {
      if (observer.current && currentSentinel) {
        observer.current.unobserve(currentSentinel);
      }
    };
  }, [handleObserver, threshold]);

  return sentinelRef;
}


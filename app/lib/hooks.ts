'use client'
import { useState, useEffect, useRef, RefObject, useCallback  } from 'react';
import { ChunkedRequest, ChunkedResponse } from '@/app/lib/sqls';

export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    if (!timeoutRef.current) {
      callbackRef.current(...args);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
      }, delay);
    }
  }, [delay]);
}

//useIntersectionObserver
export type IntersectionObserverOptions = {
  onIntersect: () => void;
  enabled: boolean;
} & IntersectionObserverInit
export const useIntersectionObserver = ({
  root,
  rootMargin,
  threshold,
  onIntersect,
  enabled,
}: IntersectionObserverOptions): RefObject<HTMLDivElement | null> => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !targetRef?.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(targetRef.current);
    return () => {
      observer.disconnect();
    };
  }, [targetRef.current, enabled]);

  return targetRef;
};

//useInfiniteScroll
export type InfiniteScrollOptions<T> = {
    selectItems: (chunkedRequest: ChunkedRequest) => Promise<ChunkedResponse<T>>;
    chunkSize: number;
    initialOffset: number;
    loadInitialData: boolean;
    onError: () => void;
}
export type  InfiniteScrollResult<T> = {
    items: T[];
    hasNextChunk: boolean;
    isLoading: boolean;
    loadMore: () => Promise<void>;
    error: boolean;

    currentOffset: number;
    reset: () => void;
}
export const useInfiniteScroll = <T>(options: InfiniteScrollOptions<T>): InfiniteScrollResult<T> => {
    const {
      selectItems,
      chunkSize,
      initialOffset,
      loadInitialData,
      onError
    } = options;
  
    const [items, setItems] = useState<T[]>([]);
    const [hasNextChunk, setHasNextChunk] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);

    const [currentOffset, setCurrentOffset] = useState(initialOffset);
    const latestRequestIdRef = useRef<number>(0);

    const loadItems = async (offset: number): Promise<void> => {
      setIsLoading(true);
      setError(false);

      const requestId = ++latestRequestIdRef.current;
  
      try {
        const response = await selectItems({ offset, limit: chunkSize });
        
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        setItems(prevItems => 
          offset === initialOffset 
            ? response.items 
            : [...prevItems, ...response.items]
        );
        
        setHasNextChunk(response.hasNextChunk);
        setCurrentOffset(offset + chunkSize);
      } catch (error) {
        console.error(`Request error (requestId: ${requestId}):`, error);
        if (requestId === latestRequestIdRef.current) {
          setError(true);
          onError();
        }
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    };
  
    useEffect(() => {
      if (loadInitialData) {
        loadItems(initialOffset);
      } else {
        setIsLoading(false);
      }
  
      return () => {
        latestRequestIdRef.current = 0;
      };
    }, [loadInitialData, initialOffset]);
  
    const loadMore = async () => {
      if (isLoading || !hasNextChunk) return;
      await loadItems(currentOffset);
    };
  
    const reset = () => {
      setItems([]);
      setCurrentOffset(initialOffset);
      setHasNextChunk(true);
      setError(false);
      loadItems(initialOffset);
    };
  
    return {
      items,
      currentOffset,
      isLoading,
      hasNextChunk,
      loadMore,
      reset,
      error
    };
  }
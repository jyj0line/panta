'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject, SetStateAction  } from 'react';
import type { ChunkedRequestType } from '@/app/lib/sqls';

//useThrottle
export const useThrottle = <T extends (...args: any[]) => any>(
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

//useDebounce
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  wait: number,
  leading?: boolean,
  maxWait?: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef<number | null>(null);
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (
        leading &&
        (!lastCallTimeRef.current ||
          currentTime - lastCallTimeRef.current >= wait)
      ) {
        lastCallTimeRef.current = currentTime;
        callbackRef.current(...args);
        return;
      }

      if (
        maxWait &&
        lastCallTimeRef.current &&
        currentTime - lastCallTimeRef.current >= maxWait
      ) {
        lastCallTimeRef.current = currentTime;
        callbackRef.current(...args);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        lastCallTimeRef.current = currentTime;
        callbackRef.current(...args);
      }, wait);
    },
    [wait, leading, maxWait]
  );
}

//useToggleVisibility
export type UseToggleVisibilityReturnType = {
  isVisible: boolean;
  setIsVisible: (value: SetStateAction<boolean>) => void;
  ref: RefObject<HTMLDivElement | null>;
}
export const useToggleVisibility = (): UseToggleVisibilityReturnType => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);
  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (event.target instanceof Node && ref.current && !ref.current.contains(event.target)) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, handleClickOutside]);
  
  return { isVisible, setIsVisible, ref };
};

//useIsVisibleAndIsSticky
type UseIsVisibleAndIsStickyProps = {threshold: number, throttleTime: number}
export const useIsVisibleAndIsSticky = ({threshold, throttleTime} : UseIsVisibleAndIsStickyProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollYRef = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > threshold) {
      setIsVisible(currentScrollY < lastScrollYRef.current);
      setIsSticky(true);
    } else {
      setIsVisible(true);
      setIsSticky(false);
    }

    lastScrollYRef.current = currentScrollY;
  }, [threshold]);

  const throttledHandleScroll = useThrottle(handleScroll, throttleTime);

  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [throttledHandleScroll]);

  return { isVisible, isSticky };
};

//useIntersectionObserver
export type IntersectionObserverProps = {
  onIntersect: () => void;
  enabled: boolean;
} & IntersectionObserverInit
export const useIntersectionObserver = ({
  root,
  rootMargin,
  threshold,
  onIntersect,
  enabled,
}: IntersectionObserverProps): RefObject<HTMLDivElement | null> => {
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
export type ChunkedResponseType<T> = {
  items: T[];
  hasNextChunk: boolean;
  totalCount?: number;
}
export type InfiniteScrollProps<TRequest extends Record<string, any>, TResponse> = {
    selectItems: (chunkedRequest: ChunkedRequestType & TRequest) => Promise<ChunkedResponseType<TResponse>>;
    request: TRequest;
    chunkSize: number;

    initialOffset: number;
    loadInitialData: boolean;

    onError: () => void;
}
export type InfiniteScrollReturn<TResponse> = {
    items: TResponse[];
    hasNextChunk: boolean;
    totalCount?: number;

    isLoading: boolean;
    isError: boolean;

    loadMore: () => Promise<void>;

    currentOffset: number;
    reset: () => void;
}
export const useInfiniteScroll = <TRequest extends Record<string, any>, TResponse>(
  props: InfiniteScrollProps<TRequest, TResponse>
  ): InfiniteScrollReturn<TResponse> => {
    const {
      selectItems,
      request,
      chunkSize,

      initialOffset,
      loadInitialData,

      onError
    } = props;
  
    const [items, setItems] = useState<TResponse[]>([]);
    const [hasNextChunk, setHasNextChunk] = useState<boolean>(true);
    const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const latestRequestIdRef = useRef<number>(0);
    const prevRequestRef = useRef<TRequest>(request);

    const [currentOffset, setCurrentOffset] = useState(initialOffset);

    const loadItems = async (offset: number): Promise<void> => {
      setIsLoading(true);
      setError(false);

      const requestId = ++latestRequestIdRef.current;
  
      try {
        const response = await selectItems({ chunk: offset, limit: chunkSize, ...request });
        
        if (requestId !== latestRequestIdRef.current) {
          return;
        }

        setItems(prevItems => 
          offset === initialOffset 
            ? response.items 
            : [...prevItems, ...response.items]
        );
        
        setHasNextChunk(response.hasNextChunk);
        setTotalCount(response?.totalCount);
        setCurrentOffset(offset + 1);
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
      if (JSON.stringify(prevRequestRef.current) != JSON.stringify(request)) {
        prevRequestRef.current = request;
        reset();
        return;
      }

      if (loadInitialData) {
        loadItems(initialOffset);
      } else {
        setIsLoading(false);
      }
  
      return () => {
        latestRequestIdRef.current = 0;
      };
    }, [loadInitialData, initialOffset, request]);
  
    const loadMore = async () => {
      if (isLoading || !hasNextChunk) return;
      await loadItems(currentOffset);
    };
  
    const reset = () => {
      setItems([]);
      setHasNextChunk(true);
      setTotalCount(undefined);

      setError(false)

      setCurrentOffset(initialOffset);

      loadItems(initialOffset);
    };
  
    return {
      items,
      hasNextChunk,
      totalCount,

      isLoading,
      isError: error,

      currentOffset,

      loadMore,
      reset,
    };
}
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject, SetStateAction } from 'react';

import { type CQ, type CS } from '@/app/lib/utils';

//useThrottle
export const useThrottle = <T extends (...args: unknown[]) => void>(
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
export const useDebounce = <T extends (...args: any[]) => void>(
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
export type UseToggleVisibilityRet = {
  isVisible: boolean;
  setIsVisible: (value: SetStateAction<boolean>) => void;
  ref: RefObject<HTMLDivElement | null>;
}
export const useToggleVisibility = (): UseToggleVisibilityRet => {
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
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, handleClickOutside]);
  
  return { isVisible, setIsVisible, ref };
};

//useIsVisibleAndIsSticky
type UseIsVisibleAndIsStickyProps = {
  threshold: number,
  throttleTime: number
}
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

//use Sync Function
type SyncFunction<TInput extends any[], TOutput> = (...input: TInput) => TOutput;
type UseSyncFunctionResult<TInput extends any[], TOutput> = [
  (...input: TInput) => void,                               
  TOutput,
  React.Dispatch<React.SetStateAction<TOutput>>,
  boolean
];
export const useSyncFunction = <TInput extends any[], TOutput>(
  syncFunc: SyncFunction<TInput, TOutput>,
  initialRes: TOutput
): UseSyncFunctionResult<TInput, TOutput> => {
  const [isLoading, setIsLoading] = useState(false);
  const [res, setRes] = useState<TOutput>(initialRes);

  const trigger = (...input: TInput): void => {
    setIsLoading(true);

    setRes(syncFunc(...input));

    setIsLoading(false);
  };

  return [trigger, res, setRes, isLoading];
};

//use Async Function
type AsyncFunction<TInput extends any[], TOutput> = (...input: TInput) => Promise<TOutput>;
type UseAsyncFunctionParam<TInput extends any[], TOutput> = {
  asyncFunc: AsyncFunction<TInput, TOutput>;
  initialRes: TOutput;
  fallbackRes: TOutput;
  mountTrigger: false;
} | {
  asyncFunc: AsyncFunction<TInput, TOutput>;
  initialRes: TOutput;
  fallbackRes: TOutput;
  mountTrigger: true;
  mountArgs: TInput;
};
type UseAsyncFunctionRet<TInput extends any[], TOutput> = [
  (...input: TInput) => Promise<void>,                              
  TOutput,
  React.Dispatch<React.SetStateAction<TOutput>>,
  boolean
];
export const useAsyncFunction = <TInput extends any[], TOutput>(
  param: UseAsyncFunctionParam<TInput, TOutput>
): UseAsyncFunctionRet<TInput, TOutput> => {
  const {
    asyncFunc,
    initialRes,
    fallbackRes,
    mountTrigger,
  } = param;

  const callIdRef = useRef(0);
  const [res, setRes] = useState<TOutput>(initialRes);
  const [isLoading, setIsLoading] = useState(mountTrigger);

  const trigger = async (...input: TInput): Promise<void> => {
    const currentCallId = ++callIdRef.current;
    setIsLoading(true);

    try {
      const result = await asyncFunc(...input);
      if (callIdRef.current === currentCallId) {
        setRes(result);
      }
    } catch {
      if (callIdRef.current === currentCallId) {
        setRes(fallbackRes);
      }
    } finally {
      if (callIdRef.current === currentCallId) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (mountTrigger) {
      trigger(...param.mountArgs);
    }
  }, []);

  return [trigger, res, setRes, isLoading];
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
  }, [enabled, onIntersect, root, rootMargin, threshold]);

  return targetRef;
};

//use infinite scroll
const INIT_CURRENT_CHUNK = 0;
type GeneralizedCP<T> = CS & { items: T[] };
export type UseInfiniteScrollProps<TRequest extends Record<string, unknown>, TResponse> = {
    getItems: (chunkedRequest: CQ & TRequest) => Promise<GeneralizedCP<TResponse>>;
    req: TRequest;
    limit: number;
}
export type InfiniteScrollRet<TResponse> = {
    items: TResponse[];
    hasNextChunk: boolean;
    totalCount: number | null;

    isLoading: boolean;
    isNewLoading: boolean;
    isError: boolean;

    loadMore: () => Promise<void>;
}
export const useInfiniteScroll = <TRequest extends Record<string, unknown>, TResponse>({
  getItems,
  req,
  limit
}: UseInfiniteScrollProps<TRequest, TResponse>): InfiniteScrollRet<TResponse> => {
    const [items, setItems] = useState<TResponse[]>([]);
    const [hasNextChunk, setHasNextChunk] = useState<boolean>(true);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);

    const [currentChunk, setCurrentChunk] = useState(INIT_CURRENT_CHUNK);
    const prevReqRef = useRef<TRequest>(req);
    const cidRef = useRef<number>(0);

    const isNewLoading = isLoading && items.length <= 0 && !totalCount;

    const loadItems = async (curChunk: number): Promise<void> => {
      setIsLoading(true);
      setIsError(false);

      const cid = ++cidRef.current;

      try {
        const res = await getItems({ chunk: curChunk, limit: limit, ...req });
        if (cid !== cidRef.current) {
          return;
        }
        
        if (curChunk === INIT_CURRENT_CHUNK) {
          setItems(res.items);
        } else {
          setItems(prevItems => [...prevItems, ...res.items]);
        }
        setHasNextChunk(res.hasNextChunk);
        setTotalCount(res?.totalCount ?? null);
        setCurrentChunk(curChunk + 1);
      } catch (error) {
        console.error(`SWW in selectItem ${cid})`, error);

        if (cid !== cidRef.current) {
          return;
        }
        
        setIsError(true);
      } finally {
        if (cid === cidRef.current) {
          setIsLoading(false);
        }
      }
    };

    const loadMore = async () => {
      if (isLoading || !hasNextChunk) return;
      await loadItems(currentChunk);
    };

    const reset = () => {
      cidRef.current = 0;
    
      setItems([]);
      setHasNextChunk(true);
      setTotalCount(null);

      setIsLoading(true);
      setIsError(false);

      loadItems(INIT_CURRENT_CHUNK);
    };

    useEffect(() => {
      if (JSON.stringify(prevReqRef.current) !== JSON.stringify(req)) {
        prevReqRef.current = req;
        reset();
        return;
      }

      loadItems(INIT_CURRENT_CHUNK);

      return () => {
        cidRef.current = 0;
      };
    }, [req]);
  
    return {
      items,
      hasNextChunk,
      totalCount,

      isLoading,
      isNewLoading,
      isError,

      loadMore
    };
}

// use pagination
type GenPaginationPsParam = {
  currentP: number,
  totalP: number | null,
  paginationPsLen: number;
};
const genPaginationPs = ({ currentP, totalP, paginationPsLen } : GenPaginationPsParam): number[] => {
  if (!totalP) return [];

  const startP = Math.floor((currentP - 1) / paginationPsLen) * paginationPsLen + 1;
  const endP = Math.min(startP + paginationPsLen - 1, totalP);

  const paginationPs: number[] = [];
  for (let i = startP; i <= endP; i++) {
    paginationPs.push(i);
  }
  return paginationPs;
};
export type UsePaginationParam<TRequest extends Record<string, unknown>, TResponse> = {
  getItems: (chunkedRequest: CQ & TRequest) => Promise<GeneralizedCP<TResponse>>,
  req: TRequest,
  p: number,
  limit: number,
  paginationPsLen: number,
}
export type UsePaginationRet<TResponse> = {
  items: TResponse[],
  totalCount: number | null,

  totalP: number | null,
  paginationPs: number[],

  isLoading: boolean,
  isNewLoading: boolean,
  isError: boolean,
}
export const usePagination = <TRequest extends Record<string, unknown>, TResponse>({
  getItems,
  req,
  p,
  limit,
  paginationPsLen
}: UsePaginationParam<TRequest, TResponse>): UsePaginationRet<TResponse> => {
  const [items, setItems] = useState<TResponse[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  
  const totalP = totalCount ? Math.ceil(totalCount/limit) : null;
  const paginationPs = genPaginationPs({currentP: p, totalP: totalP, paginationPsLen: paginationPsLen});

  const prevReqRef = useRef<TRequest>(req);
  const cidRef = useRef<number>(0);
  
  const isNewLoading = isLoading && items.length === 0 && totalCount === null;

  const loadItems = async (): Promise<void> => {
    setIsLoading(true);
    setIsError(false);

    const cid = ++cidRef.current;

    try {
      const res = await getItems({
        chunk: p - 1,
        limit: limit,
        ...req
      });

      if (cid !== cidRef.current) {
        return;
      }

      setItems(res.items);
      setTotalCount(res?.totalCount ?? null);
    } catch (error) {
      console.error(`SWW in loadItem ${cid})`, error);
      if (cid !== cidRef.current) {
        return;
      }
      
      setIsError(true);
    } finally {
      if (cid === cidRef.current) {
        setIsLoading(false);
      }
    }
  };
    
  const reset = () => {
    cidRef.current = 0;

    setItems([]);
    setTotalCount(null);

    setIsLoading(true);
    setIsError(false);

    loadItems();
  };

  useEffect(() => {
    if (JSON.stringify(prevReqRef.current) !== JSON.stringify(req)) {
      prevReqRef.current = req;
      reset();
      return;
    }

    loadItems();

    return () => {
      cidRef.current = 0;
    };
  }, [p, JSON.stringify(req)]);

  return ({
    items,
    totalCount,

    totalP,
    paginationPs,

    isLoading,
    isNewLoading,
    isError
  })
}
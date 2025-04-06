"use client";
import { useInfiniteScroll, useIntersectionObserver, InfiniteScrollProps } from '@/app/lib/hooks';
import { Card, CardLoading } from "@/app/components/Card";
import type { CardType } from '@/app/lib/sqls'
import { sqlSelectCards } from '@/app/lib/sqls'
import { Empty, End, Error} from '@/app/components/InformDataState'

const SCROLL_OPTIONS: InfiniteScrollProps<Record<string, unknown>, CardType | null> = {
  selectItems: sqlSelectCards,
  request: {},
  chunkSize: 24,
  initialChunk: 1,
  loadInitialData: true,
  onError: () => {
    console.error('Failed to load cards:');
  }
};

const loadingPlaceholders = Array.from({ length: SCROLL_OPTIONS.chunkSize }, (_, i) => (
  <CardLoading key={`loading-${i}`} />
));

export const CardGrid = () => {
  const { 
    items: cards, 
    isLoading, 
    hasNextChunk, 
    loadMore, 
    isError 
  } = useInfiniteScroll<Record<string, unknown>, CardType | null>(SCROLL_OPTIONS);

  const targetRef = useIntersectionObserver({
    root: null,
    rootMargin: '10%',
    threshold: 0.1,
    onIntersect: loadMore,
    enabled: !isLoading && hasNextChunk,
  });

  if (!isLoading && !cards.length) return <Empty />;
  return (
    <>
      <div className='relative grid grid-cols-card-grid gap-[1rem] p-[1rem]'>
      {cards.map((card) => 
        card ? <Card key={card.page_id} card={card} /> : null
      )}
      {isLoading && loadingPlaceholders}
      </div>
      <div ref={targetRef}>{!isLoading && !hasNextChunk && <End />}</div>
      {!isLoading && isError && <Error />}
    </>
  );
};
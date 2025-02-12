"use client";
import { useInfiniteScroll, useIntersectionObserver, InfiniteScrollOptions } from '@/app/lib/hooks';
import { Card, CardLoading } from "@/app/components/Card";
import type { CardType } from '@/app/lib/sqls'
import { sqlSelectCards } from '@/app/lib/sqls'
import { Empty, End, Error} from '@/app/components/InformDataState'

const SCROLL_OPTIONS: InfiniteScrollOptions<CardType> = {
  selectItems: sqlSelectCards,
  chunkSize: 24,
  initialOffset: 0,
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
    error 
  } = useInfiniteScroll<CardType>(SCROLL_OPTIONS);

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
      <div className='relative grid gap-7 grid-cols-card-grid'>
      {cards.map((card) => (
        <Card key={card.page_id} card={card} />
      ))}
      {isLoading && loadingPlaceholders}
      </div>
      <div ref={targetRef}>{!isLoading && !hasNextChunk && <End />}</div>
      {!isLoading && error && <Error showTopBorder={!cards.length}/>}
    </>
  );
};
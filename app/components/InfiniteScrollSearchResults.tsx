"use client";

import type { SearchedModeType } from "@/app/search/page"
import { SearchResultsMode } from "@/app/components/SearchResultsMode"
import { SearchResult, SearchResultSkeleton, SearchResultError } from '@/app/components/SearchResult';
import { Empty, End, Error } from '@/app/components/InformDataState'
import type { InfiniteScrollProps } from '@/app/lib/hooks';
import { useInfiniteScroll, useIntersectionObserver } from '@/app/lib/hooks';
import type { SearchedParamsType, SearchResultType } from '@/app/lib/sqls'
import { sqlSelectSimpleSearch, sqlSelectDetailedSearch } from '@/app/lib/sqls'

const CHUNK_SIZE = 12;
const FALLBACK = Array.from({ length: CHUNK_SIZE }, (_, i) => (
  <SearchResultSkeleton key={i} />
));
const TOTAL_FALLBACK = <div className="w-[4rem] h-[1rem] skeleton"></div>
type InfiniteScrollSearchResultsProps = { searchedMode: SearchedModeType, searchedParams: SearchedParamsType }
export const InfiniteScrollSearchResults = ({ searchedMode, searchedParams }: InfiniteScrollSearchResultsProps) => {
  const INFINITE_SCROLL_PROPS: InfiniteScrollProps<SearchedParamsType, SearchResultType | null> = {
    selectItems: searchedMode === "detailed" ? sqlSelectDetailedSearch : sqlSelectSimpleSearch,
    request: searchedParams,
    chunkSize: CHUNK_SIZE,

    initialChunk: 1,
    loadInitialData: true,

    onError: () => {
      console.error('Failed to load search results.');
    }
  };

  const { 
    items: searchResults,
    hasNextChunk,
    totalCount,

    isLoading,
    isError,

    loadMore
  } = useInfiniteScroll<SearchedParamsType, SearchResultType | null>(INFINITE_SCROLL_PROPS);

  const targetRef = useIntersectionObserver({
    root: null,
    rootMargin: '10%',
    threshold: 0.1,
    onIntersect: loadMore,
    enabled: !isLoading && hasNextChunk,
  });
  
  if (!isLoading && isError) return <Error />
  return (
    <div className='flex flex-col container'>
      <div className='flex flex-row justify-between items-center'>
        <div className="leading-[0.25rem] text-[1rem]">
          {(isLoading && !searchResults.length) ? TOTAL_FALLBACK : `total: ${totalCount}`}
        </div>
        <div className='flex flex-row'>
          <SearchResultsMode param='p' value='1' mode='delete' isDisabled={true} />
          <SearchResultsMode param='p' value='1' mode='set' isDisabled={false} />
        </div>
      </div>
      <div className='flex flex-col divide-y-[0.1rem]'>
      {searchResults.map((searchResult, i) => {
        if (searchResult) {
          return (<SearchResult key={searchResult.page_id} {...searchResult} />)
        } else {
          return (<SearchResultError key={i}/>)
        }
      })}
      {isLoading && FALLBACK}
      </div>
      <div ref={targetRef}></div>
      {(!isLoading && !isError && !hasNextChunk && !!searchResults.length) && <End />}
      {(!isLoading && !isError && !searchResults.length) && <Empty />}
    </div>
  );
};
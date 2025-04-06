'use client';
import { useEffect, useState, useRef } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation'; 
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import type { SearchedModeType } from "@/app/search/page"
import { SearchResultsMode } from "@/app/components/SearchResultsMode"
import { SearchResult, SearchResultSkeleton, SearchResultError } from '@/app/components/SearchResult';
import { Empty, Error } from '@/app/components/InformDataState'
import type { SearchedParamsType, SearchResultType } from '@/app/lib/sqls'
import { sqlSelectSimpleSearch, sqlSelectDetailedSearch } from '@/app/lib/sqls'
import { FirstLeftSvg, LeftSvg, RightSvg, LastRightSvg } from '@/app/lib/svgs';

const LIMIT = 12;
const FALLBACK = Array.from({ length: LIMIT }, (_, i) => (
  <SearchResultSkeleton key={i} />
));
const TOTAL_FALLBACK = <div className="w-[4rem] h-[1rem] skeleton"></div>
const PAGINATION_FALLBACK = <div className="w-[80%] h-[2rem] skeleton"></div>
const P_PER_SET = 10;

type PaginationSearchResultsProps = {
  p: number,
  searchedMode: SearchedModeType,
  searchedParams: SearchedParamsType
};
export const PaginationSearchResults = ({ p, searchedMode, searchedParams }: PaginationSearchResultsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<(SearchResultType | null)[]>([]);
  
  const latestRequestIdRef = useRef<number>(0);
  const prevP = useRef<number>(p);
  const prevSearchedParamsRef = useRef<SearchedParamsType>(searchedParams);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalP = totalCount ? Math.ceil(totalCount/LIMIT) : null;
  const paginationNumbers = generatePaginationNumbers({currentP: p, totalP: totalP, pPerSet: P_PER_SET});

  useEffect(() => {
    if (JSON.stringify(prevSearchedParamsRef.current) !== JSON.stringify(searchedParams)) {
      prevP.current = p;
      prevSearchedParamsRef.current = searchedParams;
      setIsFirst(true);
    }
    
    setIsLoading(true);
    setIsError(false);

    const requestId = ++latestRequestIdRef.current;

    const asyncSql = async () => {
      const { items: searchResultTmp, totalCount: totalCountTmp } = searchedMode === "detailed"
        ? await sqlSelectDetailedSearch({chunk: p, limit: LIMIT, ...searchedParams})
        : await sqlSelectSimpleSearch({chunk: p, limit: LIMIT, ...searchedParams});
      
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setTotalCount(totalCountTmp ?? null)
      setSearchResults([...searchResultTmp]);

      setIsLoading(false);
      setIsFirst(false);
      setIsError(false);
    }

    try {
      asyncSql();
    } catch(error) {
      console.error(`Request error (requestId: ${requestId}):`, error);
      setIsLoading(false);
      setIsFirst(true);
      if (requestId === latestRequestIdRef.current) {
        setIsError(true);
      }
    }

    return () => {
      latestRequestIdRef.current = 0;
    };
  }, [p, searchedMode, searchedParams])
  
  if (!isLoading && isError) return <Error />
  return (
    <div className='flex flex-col container'>
      <div className='flex flex-row justify-between items-center'>
        <div className="leading-[0.25rem] text-[1rem]">
          {(isLoading && isFirst) ? TOTAL_FALLBACK : `total: ${totalCount}`}
        </div>
        <div className='flex flex-row'>
          <SearchResultsMode param='p' value='1' mode='delete' isDisabled={false} />
          <SearchResultsMode param='p' value='1' mode='set' isDisabled={true} />
        </div>
      </div>
      <div className='flex flex-col divide-y-[0.1rem]'>
      {isLoading ?
      FALLBACK :
      searchResults.map((searchResult, i) => {
        if (searchResult) {
          return (<SearchResult key={searchResult.page_id} {...searchResult} />)
        } else {
          return (<SearchResultError key={i}/>)
        }
      })}
      </div>
      {(!isLoading && !isError && !searchResults.length) && <Empty />}
      {(isLoading && isFirst) ?
      PAGINATION_FALLBACK :
      !!paginationNumbers.length &&
      <div className='self-center flex flex-row'>
        <PaginationArrow direction="firstLeft" href={generatePaginationURL({pathname, searchParams, p:1})} isDisabled={p <= 1} />
        <PaginationArrow direction="left" href={generatePaginationURL({pathname, searchParams, p:Math.min(p-1, 1)})} isDisabled={p <= 1} />
        {paginationNumbers.map((pn) => {
          return <PaginationNumber
            key={pn}
            p={pn}
            href={generatePaginationURL({pathname, searchParams, p:pn})}
            isDisabled={p === pn}
        />})}
        <PaginationArrow direction="right" href={generatePaginationURL({pathname, searchParams, p:Math.min(p+1, totalP ?? p)})} isDisabled={p >= (totalP ?? p)} />
        <PaginationArrow direction="lastRight" href={generatePaginationURL({pathname, searchParams, p:totalP ?? p})} isDisabled={p >= (totalP ?? p)} />
      </div>
      }
    </div>
  );
}

type generatePaginationNumbersProps = {
  currentP: number,
  totalP: number | null,
  pPerSet: number;
}
const generatePaginationNumbers = ({currentP, totalP, pPerSet} : generatePaginationNumbersProps): number[] => {
  if (!totalP) return [];

  const startP = Math.floor((currentP - 1) / pPerSet) * pPerSet + 1;
  const endP = Math.min(startP + pPerSet - 1, totalP);

  const paginationNumbers: number[] = [];
  for (let i = startP; i <= endP; i++) {
    paginationNumbers.push(i);
  }
  return paginationNumbers;
}

type generatePaginationURLProps = {
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  p: number
}
const generatePaginationURL = ({pathname, searchParams, p} : generatePaginationURLProps) => {
  const params = new URLSearchParams(searchParams);
  params.set('p', p.toString());
  return `${pathname}?${params.toString()}`;
};

type PaginationArrowProps = {
  direction: 'left' | 'right' | 'firstLeft' | 'lastRight';
  href: string;
  isDisabled: boolean;
}
const PaginationArrow = ({ direction, href, isDisabled }: PaginationArrowProps) => {
  let icon = null;
  switch (direction) {
    case 'firstLeft':
      icon = <FirstLeftSvg className="w-[2rem] h-[2rem] p-[0.25rem]" />;
      break;
    case 'left':
      icon = <LeftSvg className="w-[2rem] h-[2rem] p-[0.25rem]" />;
      break;
    case 'right':
      icon = <RightSvg className="w-[2rem] h-[2rem] p-[0.25rem]" />;
      break;
    case 'lastRight':
      icon = <LastRightSvg className="w-[2rem] h-[2rem] p-[0.25rem]" />;
      break;
  }

  return isDisabled ? (
    <div>{icon}</div>
  ) : (
    <Link href={href}>{icon}</Link>
  );
};

type PaginationNumberProps = {
  p: number;
  href: string;
  isDisabled: boolean;
}
const PaginationNumber = ({ p, href, isDisabled }: PaginationNumberProps) => {
  return isDisabled ? (
    <div className="flex justify-center items-center w-[2rem] h-[2rem] p-[0.25rem] rounded-[0.25rem] bg-supersub">{p}</div>
  ) : (
    <Link href={href} className="flex justify-center items-center w-[2rem] h-[2rem] p-[0.25rem]">
      {p}
    </Link>
  );
}
'use client'
import {useState} from 'react';

import {SimpleSearch} from '@/app/components/SimpleSearch'
import {DetailedSearch} from '@/app/components/DetailedSearch'
import type { SearchedModeType } from '@/app/search/page'
import type { SearchedParamsType } from '@/app/lib/sqls'

type SearchProps = {
  searchedMode: SearchedModeType,
  p: number | undefined
  searchedParams: SearchedParamsType
}
export const Search = ({searchedMode, p, searchedParams}: SearchProps) => {
  const [isSimple, setIsSimple] = useState(() => searchedMode === "detailed" ? false : true);

  return (
    <div className="flex flex-col items-center w-full max-w-[60rem]">
      {isSimple ? 
      <SimpleSearch onToggle={() => setIsSimple(prev => !prev)} p={p} searchedParams={searchedParams}/> :
      <DetailedSearch onToggle={() => setIsSimple(prev => !prev)} p={p} searchedParams={searchedParams}/>
      }
    </div>
  );
}
'use client'
import { usePathname, useRouter } from 'next/navigation';

import type { SearchedParamsType } from "@/app/lib/sqls"
import { SearchCriticSelector } from '@/app/components/SearchCriticSelector';
import { useDebounce } from '@/app/lib/hooks';
import { DetailedSearchSvg, ArrowDropdownSvg } from '@/app/lib/svgs'

type SimpleSearchProps = {
  onToggle: () => void,
  p: number | undefined
  searchedParams: SearchedParamsType
}
export const SimpleSearch = ({ onToggle, p, searchedParams}: SimpleSearchProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSimpleSearch = (term: string) => {
    if (!term) return;

    const params = new URLSearchParams();
    
    params.set('search', term);
    if (p) {
      params.set('p', '1');
    }

    replace(`${pathname}?${params.toString()}`);
  }
  const debouncedHandleSimpleSearch = useDebounce(handleSimpleSearch, 300);

  return(
    <div className="flex flex-col justify-center items-center gap-[0.5rem] w-[80%]">
      <input
        placeholder={'Enter what you want to search for.'}
        defaultValue={searchedParams.search}
        onChange={(e) => {debouncedHandleSimpleSearch(e.target.value);}}
        className="search"
      />
      <div className='self-end flex flex-row items-center gap-[1.5rem]'>
        <SearchCriticSelector currentOrderCritic={searchedParams.orderCritic}/>
        <div onClick={onToggle} className='flex flex-row items-center cursor-pointer'>
          <DetailedSearchSvg className="w-[2rem] h-[2rem]"/>
          <ArrowDropdownSvg className="w-[1.5rem] h-[1.5rem]"/>
        </div>
      </div>
    </div>
  )
}
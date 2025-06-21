'use client';

import { useState } from 'react';

import { type GetSlipsReq, type GetSlipsAutReq } from "@/app/lib/SF/publicSFs";
import { type OrderCritic } from '@/app/lib/utils';
import { SimpleSearch } from '@/app/components/common/SimpleSearch';
import { DetailedSearch } from '@/app/components/common/DetailedSearch';
import { type GivenToken } from '@/app/components/common/TokenInput';
import { SlipsModeSelector } from '@/app/components/atomic/SlipsModeSelector';
import { OrderCriticSelector } from '@/app/components/atomic/OrderCriticSelector';
import { DetailedSearchSvg, ArrowDropdownSvg, ArrowDropupSvg } from "@/app/lib/svgs";

export type GSearchReq = GetSlipsReq | GetSlipsAutReq;

type SearchProps<TSearchReq extends GSearchReq> = {
  p: number | null
  searchReq: TSearchReq | null
  orderCritic: OrderCritic
  showUserIdSearch: boolean
  givenTokens?: GivenToken[]
  className?: string
};

export const Search = <TSearchReq extends GSearchReq>({
  p,
  searchReq,
  orderCritic,
  showUserIdSearch,
  givenTokens,
  className
}: SearchProps<TSearchReq>) => {
  const [isSimple, setIsSimple] = useState(() => searchReq?.searchType === "detailed" ? false : true);
  const initialSearch = searchReq?.search ?? '';

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {isSimple
      ? <SimpleSearch p={p} initialSearch={initialSearch} />
      : <DetailedSearch
          p={p}
          initialSearch={initialSearch}
          initialTagIds={searchReq?.searchType === "detailed" ? searchReq.tag_ids : []}
          initialUserIds={searchReq && 'user_ids' in searchReq && searchReq.user_ids 
            ? searchReq.user_ids 
            : []}
          initialCreatedAtFrom={searchReq?.searchType === "detailed" ? searchReq.created_at_from : ''}
          initialCreatedAtTo={searchReq?.searchType === "detailed" ? searchReq.created_at_to : ''}
          showUserIdSearch={showUserIdSearch}
          givenTokens={givenTokens}
          className='gap-[0.5rem]'
        />
      }

      <div className='flex flex-row justify-between items-end h-[2.5rem] px-[0.2rem]'>
        <SlipsModeSelector
          currentValue={p}
          className='h-full'
        />

        <div className='flex flex-row gap-[1rem] h-full'>
          <OrderCriticSelector
            currentOrderCritic={searchReq?.orderCritic ?? orderCritic}
            className='h-full'
          />

          <button
            type="button"
            onClick={() => setIsSimple(prev => !prev)}
            className='flex flex-row items-center h-full'>
            <DetailedSearchSvg className="w-atuo h-[65%] aspect-auto"/>
            {isSimple
            ? <ArrowDropdownSvg className="w-auto h-[15%] aspect-auto" />
            : <ArrowDropupSvg className="w-auto h-[15%] aspect-auto" />}
          </button>
        </div>
      </div>
    </div>
  );
}
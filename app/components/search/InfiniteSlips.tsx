"use client";

import { type GetSlipsRes, type GetSlipsReq, unifiedGetSlipsSF } from '@/app/lib/SFs/publicSFs';
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, Slip, SlipsSkeleton } from '@/app/components/leaves/Slip';
import { Empty, End, Error } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK } from "@/app/lib/constants";

const LIMIT = 12;

type InfiniteSlipsProps = {
  searchReq: GetSlipsReq
  className?: string
  itemContainerClassName?: string
};

export const InfiniteSlips = ({ searchReq, className, itemContainerClassName }: InfiniteSlipsProps) => {
  return (
    <InfiniteItems<GetSlipsReq, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>>
      getItems={unifiedGetSlipsSF}
      req={{ ...searchReq }}
      limit={LIMIT}

      renderItem={(searchSlip, additionalProps) => (
        <Slip
          key={searchSlip.page_id} 
          {...searchSlip}
          {...additionalProps}
        />
      )}
      additionalProps={{}}

      LoadingComponent={SlipsSkeleton}
      EmptyComponent={Empty}
      ErrorComponent={Error}
      EndComponent={End}

      loadingProps={{ limit: LIMIT, className: itemContainerClassName }}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${WORD_BLOCK.SEARCH_SLIPS_UPPER} loaded`, para: `There are no more ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      
      className={className}
      itemContainerClassName={itemContainerClassName}
    />
  )
};
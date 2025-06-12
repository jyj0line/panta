"use client";

import { type GetSlipsAutRes, type GetSlipsAutReq, unifiedGetSlipsAutSF } from '@/app/lib/SFs/publicSFs';
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, Slip, SlipsSkeleton } from '@/app/components/leaves/Slip';
import { Empty, End, Error, DefaultEmpty } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK, DESCRIPTION } from "@/app/lib/constants";

const LIMIT = 12;

type InfiniteAutSlipsProps = {
  searchReq: GetSlipsAutReq
  className?: string
  itemContainerClassName?: string
};

export const InfiniteAutSlips = ({ searchReq, className, itemContainerClassName }: InfiniteAutSlipsProps) => {
  return (
    <InfiniteItems<GetSlipsAutReq, GetSlipsAutRes, Omit<SlipProps, keyof GetSlipsAutRes>>
      getItems={unifiedGetSlipsAutSF}
      req={{ ...searchReq }}
      limit={LIMIT}

      isDefaultReq={searchReq.searchType === "simple" && !searchReq.search}

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
      DefaultEmptyComponent={DefaultEmpty}

      loadingProps={{ limit: LIMIT, showAuthorInfo: false, className: itemContainerClassName }}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${WORD_BLOCK.SEARCH_SLIPS_UPPER} loaded`, para: `There are no more ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_PAGES_YET, para: `` }}

      className={className}
      itemContainerClassName={itemContainerClassName}
    />
  )
};
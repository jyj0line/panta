"use client";

import { type GetSlipsAutRes, type GetSlipsAutReq, unifiedGetSlipsAutSF } from '@/app/lib/SF/publicSFs';
import { type ClassNamesProps } from "@/app/lib/utils";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/atomic/Slip';
import { Empty, End, Error, DefaultEmpty } from '@/app/components/atomic/InformDataState';

import { WORD_BLOCK, DESCRIPTION } from "@/app/lib/constants";

const LIMIT = 12;

type InfiniteAutSlipsProps = {
  searchReq: GetSlipsAutReq
} & ClassNamesProps;

export const InfiniteAutSlips = ({ searchReq, className, itemsContainerClassName, itemClassName }: InfiniteAutSlipsProps) => {
  return (
    <InfiniteItems<GetSlipsAutReq, GetSlipsAutRes, Omit<SlipProps, keyof GetSlipsAutRes>, SlipSkeletonProps>
      getItems={unifiedGetSlipsAutSF}
      req={{ ...searchReq }}
      limit={LIMIT}

      isDefaultReq={searchReq.searchType === "simple" && !searchReq.search}

      renderItem={(searchSlip, additionalProps, itemClassName) => (
        <Slip
          key={searchSlip.page_id} 
          {...searchSlip}
          {...additionalProps}
          className={`${additionalProps?.className ?? ''} ${itemClassName}`}
        />
      )}
      additionalItemProps={{}}

      LoadingComponent={SlipSkeletion}
      EmptyComponent={Empty}
      ErrorComponent={Error}
      EndComponent={End}
      DefaultEmptyComponent={DefaultEmpty}

      loadingProps={{ showAuthorInfo: false }}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${WORD_BLOCK.SEARCH_SLIPS_UPPER} loaded`, para: `There are no more ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_PAGES_YET, para: `` }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
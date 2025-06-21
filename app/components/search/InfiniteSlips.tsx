"use client";

import { type GetSlipsReq, unifiedGetSlipsSF } from '@/app/lib/SF/publicSFs';
import { type ClassNamesProps, type GetSlipsRes } from "@/app/lib/utils";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/atomic/Slip';
import { Empty, End, Error } from '@/app/components/atomic/InformDataState';

import { WORD_BLOCK } from "@/app/lib/constants";

const LIMIT = 12;

type InfiniteSlipsProps = {
  searchReq: GetSlipsReq
} & ClassNamesProps;

export const InfiniteSlips = ({ searchReq, className, itemsContainerClassName, itemClassName }: InfiniteSlipsProps) => {
  return (
    <InfiniteItems<GetSlipsReq, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>, SlipSkeletonProps>
      getItems={unifiedGetSlipsSF}
      req={{ ...searchReq }}
      limit={LIMIT}

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

      loadingProps={{}}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${WORD_BLOCK.SEARCH_SLIPS_UPPER} loaded`, para: `There are no more ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      
      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
"use client";

import { type GetSlipsReq, unifiedGetSlipsSF } from '@/app/lib/SFs/publicSFs';
import { type GetSlipsRes, type ClassNamesProps } from "@/app/lib/utils";
import { PaginationItems } from "@/app/components/common/PaginationItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/leaves/Slip';
import { Empty, Error } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK } from "@/app/lib/constants";

const LIMIT = 12;
const PAGINATION_PS_LEN = 10;

type PaginationSearchSlipsProps = {
  p: number,
  searchReq: GetSlipsReq
} & ClassNamesProps;

export const PaginationSlips = ({ p, searchReq, className, itemsContainerClassName, itemClassName }: PaginationSearchSlipsProps) => {
  return (
    <PaginationItems<GetSlipsReq, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>, SlipSkeletonProps>
      getItems={unifiedGetSlipsSF}
      req={{ ...searchReq }}
      p={p}
      paginationPsLen={PAGINATION_PS_LEN}
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

      loadingProps={{}}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      
      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
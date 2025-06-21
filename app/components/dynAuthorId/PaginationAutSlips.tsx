"use client";

import { type GetSlipsAutRes, type GetSlipsAutReq, unifiedGetSlipsAutSF } from '@/app/lib/SF/publicSFs';
import { type ClassNamesProps } from '@/app/lib/utils';
import { PaginationItems } from "@/app/components/common/PaginationItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/atomic/Slip';
import { Empty, Error, DefaultEmpty } from '@/app/components/atomic/InformDataState';

import { WORD_BLOCK, DESCRIPTION } from "@/app/lib/constants";

const LIMIT = 12;
const PAGINATION_PS_LEN = 10;

type PaginationAutSlipsProps = {
  p: number,
  searchReq: GetSlipsAutReq,
} & ClassNamesProps;

export const PaginationAutSlips = ({ p, searchReq, className, itemsContainerClassName, itemClassName }: PaginationAutSlipsProps) => {
  return (
    <PaginationItems<GetSlipsAutReq, GetSlipsAutRes, Omit<SlipProps, keyof GetSlipsAutRes>, SlipSkeletonProps>
      getItems={unifiedGetSlipsAutSF}
      req={{ ...searchReq }}
      p={p}
      paginationPsLen={PAGINATION_PS_LEN}
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
      DefaultEmptyComponent={DefaultEmpty}

      loadingProps={{ showAuthorInfo: false }}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_PAGES_YET, para: `` }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
"use client";

import { type GetSlipsRes, type GetSlipsReq, unifiedGetSlipsSF } from '@/app/lib/SFs/publicSFs';
import { PaginationItems } from "@/app/components/common/PaginationItems";
import { type SlipProps, Slip, SlipsSkeleton } from '@/app/components/leaves/Slip';
import { Empty, Error } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK } from "@/app/lib/constants";

const LIMIT = 12;
const PAGINATION_PS_LEN = 10;

type PaginationSearchSlipsProps = {
  p: number,
  searchReq: GetSlipsReq,
  className?: string,
  itemContainerClassName?: string
};

export const PaginationSlips = ({ p, searchReq, className, itemContainerClassName }: PaginationSearchSlipsProps) => {
  return (
    <PaginationItems<GetSlipsReq, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>>
      getItems={unifiedGetSlipsSF}
      req={{ ...searchReq }}
      p={p}
      paginationPsLen={PAGINATION_PS_LEN}
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

      loadingProps={{ limit: LIMIT, className: itemContainerClassName }}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      
      className={className}
      itemContainerClassName={itemContainerClassName}
    />
  )
};
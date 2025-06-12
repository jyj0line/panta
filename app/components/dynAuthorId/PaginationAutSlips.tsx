"use client";

import { type GetSlipsAutRes, type GetSlipsAutReq, unifiedGetSlipsAutSF } from '@/app/lib/SFs/publicSFs';
import { PaginationItems } from "@/app/components/common/PaginationItems";
import { type SlipProps, Slip, SlipsSkeleton } from '@/app/components/leaves/Slip';
import { Empty, Error, DefaultEmpty } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK, DESCRIPTION } from "@/app/lib/constants";

const LIMIT = 12;
const PAGINATION_PS_LEN = 10;

type PaginationAutSlipsProps = {
  p: number,
  searchReq: GetSlipsAutReq,
  className?: string,
  itemContainerClassName?: string
};

export const PaginationAutSlips = ({ p, searchReq, className, itemContainerClassName }: PaginationAutSlipsProps) => {
  return (
    <PaginationItems<GetSlipsAutReq, GetSlipsAutRes, Omit<SlipProps, keyof GetSlipsAutRes>>
      getItems={unifiedGetSlipsAutSF}
      req={{ ...searchReq }}
      p={p}
      paginationPsLen={PAGINATION_PS_LEN}
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
      DefaultEmptyComponent={DefaultEmpty}

      loadingProps={{ limit: LIMIT, showAuthorInfo: false, className: itemContainerClassName }}
      emptyProps={{ heading: `No ${WORD_BLOCK.SEARCH_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.SEARCH_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_PAGES_YET, para: `` }}

      className={className}
      itemContainerClassName={itemContainerClassName}
    />
  )
};
"use client";

import { type GetSlipsBooRes, type GetSlipsBooReq, getSlipsBooSF } from '@/app/lib/SFs/publicSFs';
import { PaginationItems } from "@/app/components/common/PaginationItems";
import { type SlipProps, Slip, SlipsSkeleton } from '@/app/components/leaves/Slip';
import { Empty, Error, DefaultEmpty } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK, DESCRIPTION } from "@/app/lib/constants";

const LIMIT = 12;
const PAGINATION_PS_LEN = 10;

type PaginationBooSlipsProps = {
  p: number,
  searchReq: GetSlipsBooReq,
  className?: string,
  itemContainerClassName?: string
};

export const PaginationBooSlips = ({ p, searchReq, className, itemContainerClassName }: PaginationBooSlipsProps) => {
  return (
    <PaginationItems<GetSlipsBooReq, GetSlipsBooRes, Omit<SlipProps, keyof GetSlipsBooRes>>
      getItems={getSlipsBooSF}
      req={{ ...searchReq }}
      p={p}
      paginationPsLen={PAGINATION_PS_LEN}
      limit={LIMIT}

      isDefaultReq={true}

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
      emptyProps={{ heading: `No ${WORD_BLOCK.BOOK_PAGE_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.BOOK_PAGE_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_BOOK_PAGES_YET, para: `` }}

      className={className}
      itemContainerClassName={itemContainerClassName}
    />
  )
};
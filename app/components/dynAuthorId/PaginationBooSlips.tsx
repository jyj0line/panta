"use client";

import { type GetSlipsBooRes, type GetSlipsBooReq, getSlipsBooSF } from '@/app/lib/SFs/publicSFs';
import { type ClassNamesProps } from '@/app/lib/utils';
import { PaginationItems } from "@/app/components/common/PaginationItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/leaves/Slip';
import { Empty, Error, DefaultEmpty } from '@/app/components/leaves/InformDataState';

import { WORD_BLOCK, DESCRIPTION } from "@/app/lib/constants";

const LIMIT = 12;
const PAGINATION_PS_LEN = 10;

type PaginationBooSlipsProps = {
  p: number,
  searchReq: GetSlipsBooReq,
} & ClassNamesProps;

export const PaginationBooSlips = ({ p, searchReq, className, itemsContainerClassName, itemClassName }: PaginationBooSlipsProps) => {
  return (
    <PaginationItems<GetSlipsBooReq, GetSlipsBooRes, Omit<SlipProps, keyof GetSlipsBooRes>, SlipSkeletonProps>
      getItems={getSlipsBooSF}
      req={{ ...searchReq }}
      p={p}
      paginationPsLen={PAGINATION_PS_LEN}
      limit={LIMIT}

      isDefaultReq={true}

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
      emptyProps={{ heading: `No ${WORD_BLOCK.BOOK_PAGE_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.BOOK_PAGE_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_BOOK_PAGES_YET, para: `` }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
"use client";

import { type GetSlipsBooRes, type GetSlipsBooReq, getSlipsBooSF } from '@/app/lib/SF/publicSFs';
import { type ClassNamesProps } from "@/app/lib/utils";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/atomic/Slip';
import { Empty, End, Error, DefaultEmpty } from '@/app/components/atomic/InformDataState';
import { DESCRIPTION, WORD_BLOCK } from '@/app/lib/constants';

const LIMIT = 12;

type InfiniteBooSlipsProps = {
  searchReq: GetSlipsBooReq
} & ClassNamesProps;

export const InfiniteBooSlips = ({ searchReq, className, itemsContainerClassName, itemClassName }: InfiniteBooSlipsProps) => {
  return (
    <InfiniteItems<GetSlipsBooReq, GetSlipsBooRes, Omit<SlipProps, keyof GetSlipsBooRes>, SlipSkeletonProps>
      getItems={getSlipsBooSF}
      req={{ ...searchReq }}
      limit={LIMIT}

      isDefaultReq={true}

      renderItem={(slip, additionalProps, itemClassName) => (
        <Slip
          key={slip.page_id} 
          {...slip}
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
      emptyProps={{ heading: `No ${WORD_BLOCK.BOOK_PAGE_SLIPS_UPPER}`, para: `There are no ${WORD_BLOCK.BOOK_PAGE_SLIPS_LOWER}.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${WORD_BLOCK.BOOK_PAGE_SLIPS_UPPER} loaded`, para: `There are no more ${WORD_BLOCK.BOOK_PAGE_SLIPS_LOWER}.` }}
      defaultEmptyProps={{ heading: DESCRIPTION.NO_BOOK_PAGES_YET, para: `` }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
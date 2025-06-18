"use client";

import { getTreSlipsSF } from '@/app/lib/SFs/publicSFs';
import { type ClassNamesProps, type GetSlipsRes } from "@/app/lib/utils";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/leaves/Slip';
import { Empty, End, Error } from '@/app/components/leaves/InformDataState';

const LIMIT = 24;
const TOTAL_LIMIT = 120;

type InfiniteTreSlipsProps = ClassNamesProps;

export const InfiniteTreSlips = ({ className, itemsContainerClassName, itemClassName }: InfiniteTreSlipsProps) => {
  return (
    <InfiniteItems<Record<string, never>, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>, SlipSkeletonProps>
      getItems={getTreSlipsSF}
      req={{}}
      limit={LIMIT}

      showTotal={false}
      totalLimit={TOTAL_LIMIT}

      renderItem={(slip, additionalProps, itemClassName) => (
        <Slip
          key={slip.page_id} 
          {...slip}
          {...additionalProps}
          className={`${additionalProps?.className ?? ''} ${itemClassName} hover:translate-y-[-0.5rem] duration-300`}
        />
      )}
      additionalItemProps={{}}

      LoadingComponent={SlipSkeletion}
      EmptyComponent={Empty}
      ErrorComponent={Error}
      EndComponent={End}

      loadingProps={{ showAuthorInfo: true }}
      emptyProps={{ heading: 'No Trend Slips', para: 'There are no trend slips.' }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: 'All Trend Slips loaded', para: 'There are no more trend slips' }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
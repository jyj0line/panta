"use client";

import { getLikSlipsASF } from '@/app/lib/SF/afterAuthSFs';
import { type ClassNamesProps, type GetSlipsRes } from "@/app/lib/utils";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/atomic/Slip';
import { Empty, End, Error } from '@/app/components/atomic/InformDataState';

const LIMIT = 24;
const TOTAL_LIMIT = 120;

type InfiniteLikSlipsProps = ClassNamesProps;

export const InfiniteLikSlips = ({ className, itemsContainerClassName, itemClassName }: InfiniteLikSlipsProps) => {
  return (
    <InfiniteItems<Record<string, never>, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>, SlipSkeletonProps>
      getItems={getLikSlipsASF}
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
      additionalItemProps={{ showCreadtedAtOrUpdatedAt: "updated_at" }}

      LoadingComponent={SlipSkeletion}
      EmptyComponent={Empty}
      ErrorComponent={Error}
      EndComponent={End}

      loadingProps={{ showAuthorInfo: true }}
      emptyProps={{ heading: 'No Like Slips', para: 'There are no like slips.' }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: 'All Like Slips loaded', para: 'There are no more like slips' }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
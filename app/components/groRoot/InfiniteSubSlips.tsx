"use client";

import { getSubSlipsASF } from '@/app/lib/SFs/afterAuthSFs';
import { type ClassNamesProps, type GetSlipsRes } from "@/app/lib/utils";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SlipProps, type SlipSkeletonProps, Slip, SlipSkeletion } from '@/app/components/leaves/Slip';
import { Empty, End, Error } from '@/app/components/leaves/InformDataState';

const LIMIT = 24;
const TOTAL_LIMIT = 120;

type InfiniteSubSlipsProps = ClassNamesProps;

export const InfiniteSubSlips = ({ className, itemsContainerClassName, itemClassName }: InfiniteSubSlipsProps) => {
  return (
    <InfiniteItems<Record<string, never>, GetSlipsRes, Omit<SlipProps, keyof GetSlipsRes>, SlipSkeletonProps>
      getItems={getSubSlipsASF}
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
      emptyProps={{ heading: 'No Subscribing Slips', para: 'There are no subscribing slips.' }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: 'All Subscribing Slips loaded', para: 'There are no more subscribing slips' }}

      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
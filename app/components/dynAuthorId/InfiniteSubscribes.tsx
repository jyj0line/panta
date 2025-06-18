"use client";

import { type GetSubscribesReq, type GetSubscribeRes, getSubscribesASF } from '@/app/lib/SFs/afterAuthSFs';
import { type ClassNamesProps } from "@/app/lib/utils";
import { type User } from "@/app/lib/tables";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { type SubscribeProps, Subscribe } from '@/app/components/dynAuthorId/Subscribe';
import { Empty, Error, End } from '@/app/components/leaves/InformDataState';
import { SpinnerSvg } from '@/app/lib/svgs';

const LIMIT = 24;

type TLoadingProps = {
  className: string
}

type InfiniteSubscribesProps = {
  authorId: User["user_id"]
  edOrIng: GetSubscribesReq["edOrIng"]
  isLoggedIn: boolean
} & ClassNamesProps;

export const InfiniteSubscribes = ({ authorId, edOrIng, isLoggedIn, className, itemsContainerClassName, itemClassName }: InfiniteSubscribesProps) => {
  return (
    <InfiniteItems<GetSubscribesReq, GetSubscribeRes, Omit<SubscribeProps, keyof GetSubscribeRes>, TLoadingProps>
      getItems={getSubscribesASF}
      req={{ authorId, edOrIng }}
      limit={LIMIT}

      loadingLimit={1}

      renderItem={(subscribe, additionalProps, itemClassName) => (
        <Subscribe 
          key={subscribe.user_id} 
          {...subscribe}
          {...additionalProps}
          className={`${additionalProps?.className ?? ''} ${itemClassName}`}
        />
      )}
      additionalItemProps={{ isLoggedIn: isLoggedIn, className: 'h-[5rem] py-[0.5rem]' }}

      LoadingComponent={SpinnerSvg}
      EmptyComponent={Empty}
      ErrorComponent={Error}
      EndComponent={End}

      loadingProps={{ className: "self-center w-[2rem] h-[2rem] animate-spin" }}
      emptyProps={{ heading: `No ${edOrIng}`, para: `There are no ${edOrIng}s.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${edOrIng}s loaded`, para: `There are no more ${edOrIng}s.` }}
      
      className={className}
      itemsContainerClassName={itemsContainerClassName}
      itemClassName={itemClassName}
    />
  )
};
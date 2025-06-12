"use client";

import Image from 'next/image';
import Link from 'next/link';

import { type GetSubscribesReq, type GetSubscribeRes, getSubscribesSF } from '@/app/lib/SFs/publicSFs';
import { type User } from "@/app/lib/tables";
import { InfiniteItems } from "@/app/components/common/InfiniteItems";
import { SubscribeButton } from "@/app/components/leaves/SubscribeButton";
import { Empty, End, Error } from '@/app/components/leaves/InformDataState';
import { SpinnerSvg } from '@/app/lib/svgs';

import { DEFAULT } from "@/app/lib/constants";

const LIMIT = 24;
 
type InfiniteSubscribesProps = {
  authorId: User["user_id"]
  readerId: User["user_id"] | null,
  edOrIng: GetSubscribesReq["edOrIng"],
  className?: string
};

export const InfiniteSubscribes = ({ authorId, readerId, edOrIng, className }: InfiniteSubscribesProps) => {
  return (
    <InfiniteItems<GetSubscribesReq, GetSubscribeRes, Omit<SubscribeProps, keyof GetSubscribeRes> >
      getItems={getSubscribesSF}
      req={{ authorId, readerId, edOrIng }}
      limit={LIMIT}

      renderItem={(subscribe, additionalProps) => (
        <Subscribe 
          key={subscribe.user_id} 
          {...subscribe}
          {...additionalProps}
        />
      )}
      additionalProps={{ readerId: readerId, className: 'h-[5rem] p-[0.5rem]' }}

      LoadingComponent={SpinnerSvg}
      EmptyComponent={Empty}
      ErrorComponent={Error}
      EndComponent={End}

      loadingProps={{ limit: LIMIT, className: "self-center w-[2rem] h-[2rem] animate-spin" }}
      emptyProps={{ heading: `No ${edOrIng}`, para: `There are no ${edOrIng}s.` }}
      errorProps={{ heading: 'Error', para: 'Something went wrong.' }}
      endProps={{ heading: `All ${edOrIng}s loaded`, para: `There are no more ${edOrIng}s.` }}
      
      className={className}
    />
  )
};



type SubscribeProps = GetSubscribeRes & {
  readerId: User["user_id"] | null
  className?: string;
};

const Subscribe = ({
  user_id,
  profile_image_url,
  is_subscribing,
  readerId,
  className="h-[4rem]"
}: SubscribeProps) => {
  return (
    <div className={`flex flex-row justify-between items-center ${className}`}>
      <div className='flex-1 flex flex-row items-center gap-[1rem] h-[70%]'>
        <Link href={`/@${user_id}`} className="relative w-auto h-full aspect-square">
          <Image
              src={profile_image_url ?? DEFAULT.DEFAULT_PROFILE_IMAGE_URL}
              alt={`${user_id}'s profile image`}
              fill
              sizes="33vw"
              className="object-cover rounded-full bg-supersub"
          />
        </Link>

        <Link href={`/@${user_id}`} className='flex-1 truncate'>{user_id}</Link>
      </div>

      {user_id !== readerId
      && <SubscribeButton
        authorId={user_id}
        readerId={readerId}
        isSubscribingInitial={is_subscribing}
      />}
    </div>
  )
};
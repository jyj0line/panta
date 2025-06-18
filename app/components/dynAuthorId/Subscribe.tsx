import Image from "next/image";
import Link from "next/link";

import { type GetSubscribeRes } from "@/app/lib/SFs/afterAuthSFs";
import { SubscribeButton } from "@/app/components/dynAuthorId/SubscribeButton";
import { DEFAULT } from "@/app/lib/constants";

export type SubscribeProps = GetSubscribeRes & {

  isLoggedIn: boolean
  className?: string;
};

export const Subscribe = ({
  user_id,
  profile_image_url,
  reader_is_subscribing,
  is_user,
  isLoggedIn,
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

      {!is_user
      && <SubscribeButton
        type="text"
        authorId={user_id}
        isLoggedIn={isLoggedIn}
        isSubscribingInitial={reader_is_subscribing}
      />}
    </div>
  )
};
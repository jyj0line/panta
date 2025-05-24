import Image from 'next/image';
import Link from "next/link";

import { SubscribeButton } from '../leaves/FollowButton';

import { type GetAuthorCardDataState, isSubscribingSF } from "@/app/lib/SFs/publicSFs";
import { type User } from '@/app/lib/tables';

import { DEFAULT } from '@/app/lib/constants';
const {
    DEFAULT_PROFILE_IMAGE_URL
} = DEFAULT;

type AuthorCardProps = {
    state: GetAuthorCardDataState
    readerId: User["user_id"] | null
    isSubscribeInfo: boolean
    className?: string
}

export const AuthorCard = async ({
    state,
    readerId,
    isSubscribeInfo,
    className="h-[10rem]"
}: AuthorCardProps) => {
    if (!state.success) {
        return (
            <div className={`flex justify-center items-center text-[2rem] text-center font-[500] ${className}`}>
                Failed To get an Author Card
            </div>
        )
    }

    const { user_id: authorId, profile_image_url, bio, subscribing_count, subscribed_count } = state.authorCardData;
    const isSubscribingInitial = readerId ? await isSubscribingSF({authorId: authorId, readerId: readerId}) : false;

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex flex-row gap-[2rem] h-full">
                <div className="relative w-auto h-full aspect-square">
                    <Image
                        src={profile_image_url ?? DEFAULT_PROFILE_IMAGE_URL}
                        alt='author profile image'
                        fill
                        sizes="33vw"
                        className="object-cover rounded-full bg-supersub"
                    />
                </div>

                <div className='flex-1 flex flex-col'>
                    <p className='text-[1.5rem] font-[500]'>
                        {authorId}
                    </p>
                    <p className='flex-1 overflow-y-auto'>
                        {bio}
                    </p>
                </div>
            </div>
            
            {isSubscribeInfo &&
            <div className='self-end flex flex-row justify-end items-center flex-wrap gap-[0.5rem]'>
                <Link href={`@${authorId}/subscribed`}  className='whitespace-pre-wrap'> {subscribed_count} subscribed </Link>
                <Link href={`@${authorId}/subscribing`} className='whitespace-pre-wrap'> {subscribing_count} subscribing </Link>
                {(readerId && (authorId !== readerId)) &&
                <SubscribeButton
                    isSubscribingInitial={isSubscribingInitial}
                    authorId={authorId}
                    readerId={readerId}
                    className='h-[2rem]'
                />
                }
            </div>}
        </div>
    )
}
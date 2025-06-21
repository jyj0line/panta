import Image from 'next/image';
import Link from "next/link";

import { SubscribeButton } from '@/app/components/dynAuthorId/SubscribeButton';

import { getAuthenticatedUserASF, isAuthorASF, isSubscribingASF } from '@/app/lib/SF/afterAuthSFs';
import { getAuthorCardDataSF } from "@/app/lib/SF/publicSFs";

import { DEFAULT } from '@/app/lib/constants';
const {
    DEFAULT_PROFILE_IMAGE_URL
} = DEFAULT;

type AuthorCardProps = {
    authorId: string
    showSubscribeInfo: boolean
    className?: string
}

export const AuthorCard = async ({
    authorId,
    showSubscribeInfo,
    className="h-[10rem]"
}: AuthorCardProps) => {
    const [authorCardDataState, isLoggedIn, isAuthor ] = await Promise.all([
        getAuthorCardDataSF(authorId),
        getAuthenticatedUserASF().then(reader => reader !== null),
        isAuthorASF(authorId)
    ]);

    if (!authorCardDataState.success) {
        return (
            <div className={`flex justify-center items-center text-[2rem] text-center font-[500] ${className}`}>
                Failed To get an Author Card
            </div>
        )
    }

    const { profile_image_url, bio, subscribing_count, subscribed_count } = authorCardDataState.authorCardData;
    const isSubscribingInitial = isLoggedIn
        ? await isSubscribingASF(authorId)
        : false
    ;

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
            
            {showSubscribeInfo &&
            <div className='self-end flex flex-row justify-end items-center flex-wrap gap-[0.5rem]'>
                <Link href={`/@${authorId}/subscribed`}  className='whitespace-pre-wrap'> {subscribed_count} subscribed </Link>
                <Link href={`/@${authorId}/subscribing`} className='whitespace-pre-wrap'> {subscribing_count} subscribing </Link>
                {!isAuthor &&
                <SubscribeButton
                    type="text"
                    isSubscribingInitial={isSubscribingInitial}
                    authorId={authorId}
                    isLoggedIn={isLoggedIn}
                    className='h-[2rem]'
                />
                }
            </div>}
        </div>
    )
}
"use client";

import Link from 'next/link';

import { useSessCtxedUserContext } from '@/app/lib/contexts/SessCtxedUserContext';
import { Logo, SmallLogo } from '@/app/components/leaves/Logos';
import { UserMenu } from '@/app/components/leaves/UserMenu';

import { SimpleSearchSvg } from '@/app/lib/svgs';

export type SCtxedUCtxedHeaderProps = {
    showSearch: boolean;
    authorId: string | null;
    className?: string;
}
export const SCtxedUCtxedHeader = ({showSearch, authorId, className="h-[2rem]"}: SCtxedUCtxedHeaderProps) => {
    const { user, isUserFirstLoading } = useSessCtxedUserContext();

    return (
        <header className={`flex flex-row justify-between items-center ${className}`}>
            {authorId ?
            <SmallLogo authorId={authorId} className="h-full text-[1.5rem] font-[500]"/>
            : <Logo className='w-auto h-full aspect-auto'/>}

            <div className='flex flex-row items-center gap-[1rem] h-full'>
            {showSearch &&
                <Link href='/search' className='w-auto h-full aspect-auto'>
                    <SimpleSearchSvg className='w-auto h-full aspect-auto'/>
                </Link>
            }
                <UserMenu user={user} isLoading={isUserFirstLoading} className='h-full'/>
            </div>
      </header>
    )
};
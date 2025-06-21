import Link from 'next/link';

import { Logo, SmallLogo } from '@/app/components/atomic/Logos';
import { type UserMenuProps, UserMenu } from '@/app/components/atomic/UserMenu';

import { SimpleSearchSvg } from '@/app/lib/svgs';

export type HeaderProps = {
    showSearch: boolean;
    authorId: string | null;
    className?: string;
    userMenuProps: UserMenuProps
};

export const Header = ({showSearch, authorId, className="h-[2rem]", userMenuProps }: HeaderProps) => {
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
                <UserMenu {...userMenuProps} />
            </div>
      </header>
    )
};
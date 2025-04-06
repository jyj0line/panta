"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from 'next-auth';

import { UserDiv } from '@/app/components/UserDiv';
import { getUser } from '@/app/lib/sqls';
import { PantaSvg, SmallPantaSvg, SimpleSearchSvg } from '@/app/lib/svgs';

type HeaderProps = {
    showSearch: boolean;
    userHomeUserId?: string;
}
export const Header = ({showSearch, userHomeUserId}: HeaderProps) => {
    const [user, setUser] = useState<User | undefined | null>(null);
    useEffect(() => {
        const fetchUser = async () => {
            const result = await getUser();
            setUser(result);
        };
        fetchUser();
    }, []);

    const userMenuItems = [
        { id: 'my pages', href: `/${user?.id}`},
    ];

    return (
        <header className='flex justify-between items-center w-full px-1 py-3'>
            <div className='flex flex-row justify-center items-center gap-[1rem]'>
                <Link href='/'>
                    {userHomeUserId && <SmallPantaSvg className="w-[2.5rem] h-[2.5rem]"/>}
                    {!userHomeUserId && <PantaSvg className='aspect-auto h-9'/>}
                </Link>
                {userHomeUserId && <Link href={`/${userHomeUserId}`} className="text-[1.5rem] font-[400] truncate">{userHomeUserId}</Link>}
            </div>
            {user === null &&
            <div>now loading...</div>
            }
            {user === undefined &&
            <div className='flex justify-center items-center gap-x-2'>
                <Link href='/login' className='flex justify-center items-center h-9 p-4 rounded-full bg-sub'>Login</Link>
                <Link href='/signup' className='flex justify-center items-center h-9 p-4 rounded-full bg-sub'>Sign Up</Link>
            </div>
            }
            {user &&
            <div className='flex flex-row gap-3'>
            {showSearch &&
            <Link href='/search'>
                <SimpleSearchSvg className='w-8 h-8'/>
            </Link>
            }
            <UserDiv userMenuItems={userMenuItems}/>
            </div>
            }
      </header>
    )
}
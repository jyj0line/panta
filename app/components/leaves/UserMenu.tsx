"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { User } from 'next-auth';

import { logoutRedirectSF } from '@/app/lib/SFs/publicSFs';
import { useToggleVisibility } from '@/app/lib/hooks';

import { ArrowDropdownSvg } from '@/app/lib/svgs';
import { DEFAULT } from '@/app/lib/constants';
const {
  DEFAULT_PROFILE_IMAGE_URL: PROFILE_IMAGE_URL
} = DEFAULT;

export type UserMenuProps = {
  user: User | null
  isUserFirstLoading: boolean
  className?: string
}
export const UserMenu = ({ user, isUserFirstLoading, className="h-[2rem]" }: UserMenuProps) => {
  const { isVisible, setIsVisible, ref } = useToggleVisibility();

  if (isUserFirstLoading) {
    return (
      <div className={`flex flex-row items-center gap-[0.5rem] ${className}`}>
        <div className="w-auto h-full aspect-square rounded-full bg-supersub animate-pulse" />
        <div className="w-auto h-[40%] aspect-square rounded-full bg-supersub animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex flex-row items-center gap-[0.5rem] ${className}`}>
          <Link href='/login' className='flex justify-center items-center px-[0.7rem] py-[0.2rem] rounded-[0.5rem] bg-supersub'>Login</Link>
          <Link href='/signup' className='flex justify-center items-center px-[0.7rem] py-[0.2rem] rounded-[0.5rem] bg-sub text-background'>Sign Up</Link>
      </div>
    );
  }

  return(
    <div className={`flex flex-row gap-[1rem] ${className}`}>
      <Link href='/write' className='flex justify-center items-center h-full p-[0.5rem] border-[0.1rem] border-em rounded-full'>
        Write
      </Link>
      
      <div ref={ref} className='relative h-full'>
        <button
          type="button"
          onClick={() => setIsVisible(prev => !prev)}
          className='flex flex-row items-center gap-[0.5rem] h-full'
        >
          <div className="relative w-auto h-full aspect-square">
            <Image
              src={user.profile_image_url ?? PROFILE_IMAGE_URL}
              alt='user menu'
              fill
              sizes="33vw"
              className="object-cover rounded-full bg-supersub"
            />
          </div>
          <ArrowDropdownSvg className='w-auto h-[20%] aspect-auto' />
        </button>

        {isVisible &&
        <div
          className='
            absolute top-[125%] right-[0px] z-[10]
            flex flex-col items-start
            min-w-max bg-wh border-[0.1rem] border-supersub
          '
        >
          <Link href={`/@${user.user_id}`} className='px-[1rem] py-[0.5rem]'>my page</Link>
          <Link href='/setting' className='px-[1rem] py-[0.5rem]'>setting</Link>
          <button type="button" onClick={logoutRedirectSF} className='px-[1rem] py-[0.5rem]'>logout</button>
        </div>}
      </div>
    </div>
  )
}
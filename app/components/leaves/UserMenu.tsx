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
type UserMenuProps = {
  user: User | null
  isLoading: boolean
  className?: string
}
export const UserMenu = ({ user, isLoading, className="h-[2rem]" }: UserMenuProps) => {
  const { isVisible, setIsVisible, ref } = useToggleVisibility();

  if (isLoading) {
    return (
      <div className={`flex flex-row items-center gap-[0.5rem] mr-[0.9rem] ${className}`}>
        <div className="w-auto h-full aspect-square rounded-full bg-supersub animate-pulse" />
        <div className="w-auto h-[30%] aspect-square rounded-full bg-supersub animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex flex-row items-center gap-[0.5rem] ${className}`}>
          <Link href='/login' className='flex justify-center items-center px-[0.8rem] py-[0.4rem] rounded-[0.5rem] bg-supersub'>Login</Link>
          <Link href='/signup' className='flex justify-center items-center px-[0.8rem] py-[0.4rem] rounded-[0.5rem] bg-sub text-background'>Sign Up</Link>
      </div>
    );
  }

  return(
    <div ref={ref} className={`relative cursor-pointer ${className}`}>
      <div onClick={() => setIsVisible(prev => !prev)} className='flex flex-row items-center gap-[0.5rem] h-full'>
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
      </div>

      {isVisible &&
      <div
        className='
          absolute top-[100%] right-0 z-[10]
          flex flex-col items-start gap-[1rem]
          min-w-max px-[1rem] py-[0.5rem] mt-[0.7rem] bg-wh shadow-lg
        '
      >
        <Link href={`/@${user.user_id}`}>my page</Link>
        <Link href='/setting'>setting</Link>
        <button type="button" onClick={logoutRedirectSF}>logout</button>
      </div>
      }
    </div>
  )
}
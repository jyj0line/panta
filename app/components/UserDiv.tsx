'use client'
import Image from 'next/image';
import Link from 'next/link';

import { getUserId } from '@/app/lib/utils';
import { useToggleVisibility } from '@/app/lib/hooks';
import { ArrowDropdownSvg } from '@/app/lib/svgs';

/// dummy
import userProfileImage from '@/public/a.png';
const userId = getUserId();
const userMenuItems = [
  { id: 'my pages', href: `/${userId}`},
  { id: 'logout', href: '/' }
];
///

export const UserDiv = () => {
  const { isVisible, setIsVisible, ref } = useToggleVisibility();
  
  return(
    <div ref={ref} className='relative flex justify-center items-center gap-x-0.5 z-10'>
      <div onClick={() => setIsVisible(prev => !prev)} className="flex flex-row items-center">
        <Image src={userProfileImage} alt='userDiv' className='w-7 h-7 rounded-full cursor-pointer'></Image>
        <ArrowDropdownSvg className='w-auto h-9 cursor-pointer' />
      </div>
      {isVisible &&
      <div className='flex flex-col justify-center absolute min-w-max right-0 top-full mt-2 shadow-lg bg-background'>
        {userMenuItems.map(({ id, href }) => (
        <Link key={id} href={href} className='px-4 py-2 text-md'>{id}</Link>
      ))}
      </div>
      }
    </div>
  )
}
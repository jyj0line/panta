'use client'
import {useState, useRef, useCallback, useEffect} from 'react'
import Image from 'next/image'
import Link from 'next/link'

import {ArrowDropDown} from '@/app/lib/svgs'

///dummy
const userId = '1'
import userProfileImage from '@/public/a.png'
const userMenuItems = [
  { id: 'my pages', href: `/${userId}`},
  { id: 'settings', href: '/setting' },
  { id: 'logout', href: '/' }
];
///

const UserDiv = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userDivRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);
  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (userDivRef.current && !userDivRef.current.contains(event.target as Node)) {
      setShowUserMenu(false);
    }
  }, []);

  useEffect(() => {
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);
  
  return(
    <div ref={userDivRef} className='relative flex justify-center items-center gap-x-0.5 z-10'>
      <Image src={userProfileImage} alt='userDiv' onClick={toggleMenu} className='w-7 h-7 rounded-full cursor-pointer'></Image>
      <ArrowDropDown onClick={toggleMenu} className='w-auto h-9 cursor-pointer'></ArrowDropDown>
      {showUserMenu &&
      <div className='flex flex-col justify-center absolute min-w-max right-0 top-full mt-2 shadow-lg bg-background'>
        {userMenuItems.map(({ id, href }) => (
        <Link key={id} href={href} className='px-4 py-2 text-md'>{id}</Link>
      ))}
      </div>
      }
    </div>
  )
}

export default UserDiv;
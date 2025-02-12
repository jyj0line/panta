'use client'
import { useState, useRef, useEffect, useCallback } from 'react';

import Header from '@/app/components/Header'
import Tabs from '@/app/components/TabBar'
import { useThrottle } from '@/app/lib/hooks'

const RootGroupHT = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollYRef = useRef(0);

  const handleScrollForThrottle = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
      setIsVisible(currentScrollY < lastScrollYRef.current);
      setIsSticky(true);
    } else {
      setIsVisible(true);
      setIsSticky(false);
    }

    lastScrollYRef.current = currentScrollY;
  }, []);

  const handleScroll = useThrottle(handleScrollForThrottle, 100);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  return (
    <div className={`sticky top-0 z-10 transition-all -translate-y-0 ${isVisible ? '' : '-translate-y-full'} ${isVisible && isSticky? 'shadow-md' : ''} bg-neutral-100`}>
      <div className='container'>
        <Header/>
        <Tabs/>
      </div>
    </div>
  );
}

export default RootGroupHT;
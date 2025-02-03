'use client'
import {useState, useRef, useEffect} from 'react';

import Header from '@/app/components/Header'
import Tabs from '@/app/components/TabBar'
import {throttle} from '@/app/lib/utils'

const RootGroupHT = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollYRef = useRef(0);
  const throttledFuncRef = useRef< () => void | null>(null);

  useEffect(() => {
    throttledFuncRef.current = throttle(() => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        setIsVisible(currentScrollY < lastScrollYRef.current);
        setIsSticky(true);
      } else {
        setIsVisible(true);
        setIsSticky(false);
      }
      lastScrollYRef.current = currentScrollY;
    }, 100);

    window.addEventListener('scroll', throttledFuncRef.current);
    
    return () => {
      if (throttledFuncRef.current) {
        window.removeEventListener('scroll', throttledFuncRef.current);
      }
    };
  }, []);

  return (
    <div className={`sticky top-0 z-10 transition-all -translate-y-0 ${isVisible ? '' : '-translate-y-full'} ${isVisible && isSticky? 'shadow-md' : ''} bg-background `}>
      <div className='container'>
        <Header/>
        <Tabs/>
      </div>
    </div>
  );
}

export default RootGroupHT;
'use client'
import { Header } from '@/app/components/Header'
import { useIsVisibleAndIsSticky } from '@/app/lib/hooks'

export const SearchHeader = () => {
  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: 100, throttleTime: 50});
  
  return (
      <div className={`sticky top-0 z-10 transition-all -translate-y-0 ${isVisible ? '' : '-translate-y-full'} ${isVisible && isSticky? 'shadow-md' : ''} bg-background`}>
        <div className='container pt-[1rem]'>
          <Header showSearch={false}/>
        </div>
      </div>
  );
}
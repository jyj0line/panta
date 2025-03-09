'use client'

import Header from '@/app/components/Header'
import { TabBar } from '@/app/components/TabBar'
import { useIsVisibleAndIsSticky } from '@/app/lib/hooks'

const RootGroupHT = () => {
  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: 100, throttleTime: 50});
  
  return (
    <div className={`sticky top-0 z-10 transition-all -translate-y-0 ${isVisible ? '' : '-translate-y-full'} ${isVisible && isSticky? 'shadow-md' : ''} bg-neutral-100`}>
      <div className='container'>
        <Header showSearch={true}/>
        <TabBar/>
      </div>
    </div>
  );
}

export default RootGroupHT;
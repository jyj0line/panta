'use client'
import { SCtxedUCtxedHeader } from '@/app/components/common/SCtxedUCtxedHeader';
import { TabBar } from '@/app/components/leaves/Tabs';
import { useIsVisibleAndIsSticky } from '@/app/lib/hooks';

const tabs = [
  { id: 'trend', href: '/trend'},
  { id: 'subscription', href: '/subscription' },
  { id: 'pagemark', href: '/pagemark' }
];

export const RootGroupHeaderWithTabBar = () => {
  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: 100, throttleTime: 50});
  
  return (
    <div className={`sticky top-0 z-10 transition-all -translate-y-0 ${isVisible ? '' : '-translate-y-full'} ${isVisible && isSticky? 'shadow-md' : ''} bg-powerbackground`}>
      <div className='container'>
        <SCtxedUCtxedHeader showSearch={true}/>
        <TabBar/>
      </div>
    </div>
  );
}
"use client"
import { useParams } from 'next/navigation';

import { Header } from '@/app/components/Header';
import { useIsVisibleAndIsSticky } from '@/app/lib/hooks';

const UserIdDynamicLayout = ({ children }: Readonly<{children: React.ReactNode}>) => {
  const params = useParams<{userId: string}>(); 
  const userId = params?.userId;

  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: 100, throttleTime: 50});
  
  return(
    <div>
      <div
        className={`sticky top-0 z-10
        transition-all -translate-y-0
        ${isVisible ? '' : '-translate-y-full'}
        ${isVisible && isSticky? 'shadow-md' : ''}
        bg-background`}
      >
        <div className='container'>
          <Header showSearch={true} userHomeUserId={userId}/>
        </div>
      </div>
      <div className='little_container'>
        {children}
      </div>
    </div>
    )
}
export default UserIdDynamicLayout;
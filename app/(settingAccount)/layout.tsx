"use client";

import { SessionProvider } from 'next-auth/react';

import { SessCtxedUserProvider } from '@/app/lib/contexts/SessCtxedUserContext';
import { SCtxedUCtxedStickyHeader } from '@/app/components/common/SCtxedUCtxedStickyHeader';

const SettingLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return(
    <SessionProvider>
      <SessCtxedUserProvider>
        <div className='relative flex flex-col min-h-dvh'>
          <SCtxedUCtxedStickyHeader showSearch={true} authorId={null} className="little_container h-[3rem] p-[0.5rem]" />
          
          <div className="small_container flex justify-center items-center flex-1 px-[1rem] py-[2rem]">
            {children}
          </div>
        </div>
      </SessCtxedUserProvider>
    </SessionProvider>
  )
};
export default SettingLayout;
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { SessCtxedUserProvider } from '@/app/lib/contexts/SessCtxedUserContext';
import { SCtxedUCtxedStickyHeader } from '@/app/components/common/SCtxedUCtxedStickyHeader';
import { Tabs } from '@/app/components/leaves/Tabs';

export const metadata: Metadata = {
  title: 'Setting'
};

const settingtTabs = [
  {id: 'profile', href: '/setting'},
  {id: 'account', href: '/setting/account'}
]
const SettingLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return(
    <SessionProvider>
      <SessCtxedUserProvider>
        <div className='relative min-h-dvh'>
          <SCtxedUCtxedStickyHeader showSearch={true} authorId={null} className="little_container h-[3rem] p-[0.5rem]">
            <Tabs tabs={settingtTabs} className="justify-around little_container h-[3rem]"/>
          </SCtxedUCtxedStickyHeader>
          <div className="small_container">
            {children}
          </div>
        </div>
      </SessCtxedUserProvider>
    </SessionProvider>
  )
};
export default SettingLayout;
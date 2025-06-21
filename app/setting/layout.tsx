import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { SessCtxedUserProvider } from '@/app/lib/context/SCtxedUserContext';
import { StickyDiv } from "@/app/components/div/StickyDiv";
import { SCtxedUCtxedHeader } from "@/app/components/common/SCtxedUCtxedHeader";
import { type Tab, Tabs } from '@/app/components/atomic/Tabs';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Setting'
  }
};

const settingtTabs: Tab[] = [
  {id: 'profile', href: '/setting', matchSubRoutes: false},
  {id: 'account', href: '/setting/account', matchSubRoutes: false}
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
          <StickyDiv effect="shadow">
            <SCtxedUCtxedHeader
              showSearch={true}
              authorId={null}
              className="little_container h-[3rem] p-[0.5rem]"
              userMenuClassName="h-full"
            />
            <Tabs initTabs={settingtTabs} className="justify-around little_container h-[3.5rem] p-[0.5rem]"/>
          </StickyDiv>

          <div className="small_container">
            {children}
          </div>
        </div>
      </SessCtxedUserProvider>
    </SessionProvider>
  )
};
export default SettingLayout;
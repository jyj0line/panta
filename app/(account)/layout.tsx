import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";

import { SessCtxedUserProvider } from '@/app/lib/context/SCtxedUserContext';
import { StickyDiv } from "@/app/components/div/StickyDiv";
import { SCtxedUCtxedHeader } from "@/app/components/common/SCtxedUCtxedHeader";

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Setting: Account'
  }
};

const SettingLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return(
    <SessionProvider>
      <SessCtxedUserProvider>
        <div className='relative flex flex-col min-h-dvh'>
          <StickyDiv>
            <SCtxedUCtxedHeader
              showSearch={true}
              authorId={null}
              className="little_container h-[3rem] p-[0.5rem]"
              userMenuClassName="h-full"
            />
          </StickyDiv>

          <div className="small_container flex justify-center items-center flex-1 p-[2rem]">
            {children}
          </div>
        </div>
      </SessCtxedUserProvider>
    </SessionProvider>
  )
};
export default SettingLayout;
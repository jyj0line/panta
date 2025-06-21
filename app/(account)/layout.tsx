import { type Metadata } from "next";

import { getAuthenticatedUserASF } from '@/app/lib/SF/afterAuthSFs';
import { StickyDiv } from '@/app/components/div/StickyDiv';
import { Header } from '@/app/components/common/Header';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Setting: Account'
  }
};

const SettingLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await getAuthenticatedUserASF();

  return(
    <div className='relative flex flex-col min-h-dvh'>
      <StickyDiv>
        <Header
          showSearch={true}
          authorId={null}
          className="little_container h-[3rem] p-[0.5rem]"
          userMenuProps={{
            user: user,
            isUserFirstLoading: false,
            className: "h-full"
          }}
        />
        </StickyDiv>

        <div className="small_container flex justify-center items-center flex-1 p-[2rem]">
          {children}
        </div>
    </div>
  )
};
export default SettingLayout;
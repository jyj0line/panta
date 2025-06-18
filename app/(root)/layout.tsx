import { type Metadata } from 'next';

import { getAuthenticatedUserASF, isNewSubASF, isNewLikASF } from '@/app/lib/SFs/afterAuthSFs';
import { StickyDiv } from '@/app/components/divs/StickyDiv';
import { Header } from '@/app/components/common/Header';;
import { Tabs } from '@/app/components/leaves/Tabs';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Panta'
  }
};

const GroRootLayout = async ({
  children
}: { children: React.ReactNode }) => {
  const [reader, subHasUpdate, likeHasUpadte] = await Promise.all([
    getAuthenticatedUserASF(),
    isNewSubASF(),
    isNewLikASF()
  ]);

  const initTabs = [
    { id: 'trend', href: '/', matchSubRoutes: false, hasUpdate: false },
    { id: 'subscribing', href: '/subscribing', matchSubRoutes: false, hasUpdate: subHasUpdate },
    { id: 'like', href: '/like', matchSubRoutes: false, hasUpdate: likeHasUpadte }
  ];
  
  return(
    <div className='relative flex flex-col min-h-dvh'>
      <StickyDiv effect='shadow'>
        <Header
          showSearch={true}
          authorId={null}
          className="little_container h-[3rem] py-[0.5rem]"
          userMenuProps={{
            user: reader?? null,
            isUserFirstLoading: false,
            className: 'h-full'
          }}
        />

        <Tabs initTabs={initTabs} className="little_container h-[3rem]"/>
      </StickyDiv>

      {children}
    </div>
  );
}
export default GroRootLayout;
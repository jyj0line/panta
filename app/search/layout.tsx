import type { Metadata } from 'next';

import { getAuthenticatedUserASF } from '@/app/lib/SF/afterAuthSFs';
import { StickyDiv } from '@/app/components/div/StickyDiv';
import { Header } from '../components/common/Header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Search'
  }
};

const SearchLayout = async ({
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

        <div className="flex-1 flex flex-col small_container p-[2rem]">
          {children}
        </div>
    </div>
  )
};
export default SearchLayout;
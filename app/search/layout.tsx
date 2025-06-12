import { getAuthenticatedUserASF } from '@/app/lib/SFs/afterAuthSFs';
import { StickyDiv } from '@/app/components/divs/StickyDiv';
import { Header } from '../components/common/Header';

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

        <div className="small_container flex flex-1 p-[2rem]">
          {children}
        </div>
    </div>
  )
};
export default SearchLayout;
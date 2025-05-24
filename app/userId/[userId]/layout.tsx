import { notFound, useParams } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

import { SessCtxedUserProvider } from '@/app/lib/contexts/SessCtxedUserContext';
import { SCtxedUCtxedStickyHeader } from '@/app/components/common/SCtxedUCtxedStickyHeader';
import { parseString } from '@/app/lib/utils';

const UserIdDynamicLayout = async ({ children }: Readonly<{children: React.ReactNode}>) => {
  const params = useParams(); 
  const userId = params.userId;
  const parsedUserId = parseString(userId);
  const 
  

  return(
    <div className='relative'>
      <SessionProvider>
        <SessCtxedUserProvider>
          <SCtxedUCtxedStickyHeader
            showSearch={true}
            authorId={userId}
            className="little_container h-[2rem] px-[1rem] mt-[1rem]"
          />
        </SessCtxedUserProvider>
      </SessionProvider>

      <div className='little_container'>
        {children}
      </div>
    </div>
    )
}
export default UserIdDynamicLayout;
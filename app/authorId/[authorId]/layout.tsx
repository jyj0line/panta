import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

import { isExistentUserIdSF } from "@/app/lib/SFs/publicSFs";
import { SessCtxedUserProvider } from '@/app/lib/contexts/SessCtxedUserContext';
import { SCtxedUCtxedStickyHeader } from '@/app/components/common/SCtxedUCtxedStickyHeader';

import { METADATA } from '@/app/lib/constants';
const {
  NOT_FOUND_TITLE_METADATA
} = METADATA;

type AuthorIdDynamicMetadataProps = {
  params: Promise<{ authorId: string }>
}

export const generateMetadata = async (
  { params }: AuthorIdDynamicMetadataProps
): Promise<Metadata> => {
  const ps = await params;
  const authorId = ps.authorId;
  const isExistentUserId = await isExistentUserIdSF(authorId);

  if (!isExistentUserId) {
    return {
      title: NOT_FOUND_TITLE_METADATA
    }
  }
  return {
    title: `@${authorId}`
  }
};

const AuthorIdDynamicLayout = async ({
  params,
  children
}: {
  params: Promise<{ authorId: string }>
  children: React.ReactNode
}) => {
  const ps = await params;
  const authorId = ps.authorId;
  const isExistentUserId = await isExistentUserIdSF(authorId);

  if (!isExistentUserId) notFound();
  
  return(
    <div className='relative'>
      <SessionProvider>
        <SessCtxedUserProvider>
          <SCtxedUCtxedStickyHeader
            showSearch={true}
            authorId={authorId}
            className="little_container h-[3rem] p-[0.5rem]"
          />
        </SessCtxedUserProvider>
      </SessionProvider>

      <div className='small_container p-[2rem]'>
        {children}
      </div>
    </div>
  );
}
export default AuthorIdDynamicLayout;
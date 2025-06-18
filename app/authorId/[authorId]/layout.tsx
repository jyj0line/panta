import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAuthenticatedUserASF } from '@/app/lib/SFs/afterAuthSFs';
import { isExistentUserIdSF } from "@/app/lib/SFs/publicSFs";
import { StickyDiv } from '@/app/components/divs/StickyDiv';
import { Header } from '@/app/components/common/Header';;

import { METADATA } from '@/app/lib/constants';
const {
  NOT_FOUND_TITLE_METADATA
} = METADATA;

type GenerateMetadataParam = {
  params: Promise<{ authorId: string }>
}

export const generateMetadata = async (
  { params }: GenerateMetadataParam
): Promise<Metadata> => {
  const ps = await params;
  const authorId = ps.authorId;
  const isExistentUserId = await isExistentUserIdSF(authorId);

  if (!isExistentUserId) {
    return {
      title: {
        template: '%s | Panta',
        default: NOT_FOUND_TITLE_METADATA
      }
    }
  }

  return {
    title: {
      template: '%s | Panta',
      default: `@${authorId}`
    }
  }
};

const DynAuthorIdLayout = async ({
  params,
  children
}: {
  params: Promise<{ authorId: string }>
  children: React.ReactNode
}) => {
  const { authorId } = await params;
  const [ isExistentUserId, readerId ] = await Promise.all([
    isExistentUserIdSF(authorId),
    getAuthenticatedUserASF()
  ]);

  if (!isExistentUserId) notFound();

  return(
    <div className='relative flex flex-col min-h-dvh'>
      <StickyDiv isStickyEffect={false}>
        <Header
          showSearch={true}
          authorId={authorId}
          className="little_container h-[3rem] p-[0.5rem]"
          userMenuProps={{
            user: readerId,
            isUserFirstLoading: false,
            className: 'h-full'
          }}
        />
      </StickyDiv>

      {children}
    </div>
  );
}
export default DynAuthorIdLayout;
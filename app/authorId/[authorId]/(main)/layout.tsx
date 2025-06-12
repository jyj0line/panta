import { notFound } from 'next/navigation';

import { isExistentUserIdSF } from "@/app/lib/SFs/publicSFs";
import { AuthorCard } from "@/app/components/common/AuthorCard";
import { Tabs } from '@/app/components/leaves/Tabs';

const DynAutGroMainLayout = async ({
  params,
  children
}: {
  params: Promise<{ authorId: string }>
  children: React.ReactNode
}) => {
  const { authorId } = await params;
  const isExistentUserId = await isExistentUserIdSF(authorId);

  if (!isExistentUserId) notFound();

  const authorIdTabs = [
    { id: 'All', href: `/@${authorId}`, matchSubRoutes: false },
    { id: 'Books', href: `/@${authorId}/books`, matchSubRoutes: true }
  ];

  return (
    <div className='flex flex-col small_container p-[2rem]'>
        <AuthorCard
            authorId={authorId}
            showSubscribeInfo={true}
            className="gap-[0.5rem] h-[13rem] py-[1.5rem]"
        />

        <Tabs tabs={authorIdTabs} className="justify-around h-[6rem] py-[1.5rem]"/>

        {children}
    </div>
  );
}
export default DynAutGroMainLayout;
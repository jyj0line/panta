import type { Metadata } from 'next';

import { sqlSelectPage } from "@/app/lib/sqls";

const PageIdDynamicPage = async ({
  params,
}: {
  params: Promise<{ userId: string; pageId: string; }>
}) => {
  const { userId, pageId } = await params;

  const page = await sqlSelectPage(pageId);

  return (
    <div>hi</div>
    // <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
    //   <Table query={query} currentPage={currentPage} />
    // </Suspense>
  )
}
export default PageIdDynamicPage;
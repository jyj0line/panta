import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';

import {
  type SelectWritePageRet,
  type SelectWriteBooksRet,
  getWriteTitleASF,
  getAuthenticatedUserASF,
  selectWritePageASF,
  selectWriteBooksASF
} from '@/app/lib/SFs/afterAuthSFs';
import { ToastBundleProvider } from '@/app/lib/contexts/ToastBundleContext';
import { WriteForm } from '@/app/components/write/WritieForm';
import { parseString } from '@/app/lib/utils';

import { METADATA } from '@/app/lib/constants';
const {
  WRITE_TITLE_METADATA
} = METADATA;

type MetadataProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = async (
  { searchParams }: MetadataProps
): Promise<Metadata> => {
  const sp = await searchParams;
  const page_id = parseString(sp.page_id);

  if (page_id) {
    const title = await getWriteTitleASF(page_id);
 
    return {
      title: title
    }
  } else {
    return {
      title: WRITE_TITLE_METADATA
    }
  }
};

const WritePageIdPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const user = await getAuthenticatedUserASF();
  if (!user || !user.user_id) redirect("/login");
  
  const sp = await searchParams;
  const page_id = parseString(sp.page_id);

  const [page, books]: [SelectWritePageRet, SelectWriteBooksRet] = await Promise.all([
    page_id ? selectWritePageASF({page_id}) : Promise.resolve({
      page_id: '',
      user_id: user.user_id,
      book_id: '',
    
      title: '',
      preview: '',
      content: '',
    
      tag_ids: []
    }),
    selectWriteBooksASF()
  ]);
  
  if (!page) notFound();
  if (page.user_id !== user.user_id) notFound();

  return (
    <ToastBundleProvider>
      <WriteForm page={page} books={books} />
    </ToastBundleProvider>
  );
}
export default WritePageIdPage;
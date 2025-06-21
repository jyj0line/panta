import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';

import {
  type SelectWritePageRet,
  type SelectWriteBooksRet,
  getWriteTitleASF,
  getAuthenticatedUserASF,
  selectWritePageASF,
  selectWriteBooksASF
} from '@/app/lib/SF/afterAuthSFs';
import { type SearchParams } from "@/app/lib/utils";
import { WriteForm } from '@/app/components/write/WritieForm';
import { parseSPVString } from '@/app/lib/utils';

import { METADATA } from '@/app/lib/constants';
const {
  WRITE_TITLE_METADATA
} = METADATA;

type MetadataProps = {
  searchParams: Promise<SearchParams>
}

export const generateMetadata = async (
  { searchParams }: MetadataProps
): Promise<Metadata> => {
  const sp = await searchParams;
  const page_id = parseSPVString(sp.page_id);

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
  searchParams: Promise<SearchParams>
}) => {
  const writer = await getAuthenticatedUserASF();
  if (!writer || !writer.user_id) redirect("/login");
  
  const sp = await searchParams;
  const page_id = parseSPVString(sp.page_id);

  const [page, books]: [SelectWritePageRet, SelectWriteBooksRet] = await Promise.all([
    page_id ? selectWritePageASF({page_id}) : Promise.resolve({
      page_id: '',
      user_id: writer.user_id,
      book_id: '',
    
      title: '',
      preview: '',
      content: '',
    
      tag_ids: []
    }),
    selectWriteBooksASF()
  ]);

  if (!page) notFound();
  if (page.user_id !== writer.user_id) notFound();

  return (
    <WriteForm page={page} initBooks={books} />
  );
}
export default WritePageIdPage;
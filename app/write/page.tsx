import { notFound } from 'next/navigation';

import { WriteForm } from '@/app/components/WritieForm'
import type { SelectedWriteFormPageType, SelectWriteFormBooksType } from '@/app/lib/sqls';
import { sqlSelectWriteFormPage, sqlSelectWriteFormBooks } from '@/app/lib/sqls';
import { getUserId, parseString } from '@/app/lib/utils';

const WritePageIdPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const sp = await searchParams;
  const page_id = parseString(sp.page_id);

  const [page, books]: [SelectedWriteFormPageType, SelectWriteFormBooksType] = await Promise.all([
    page_id ? sqlSelectWriteFormPage(page_id) : Promise.resolve({
      page_id: '',
      user_id: getUserId(),
      book_id: '',
    
      title: '',
      preview: '',
      content: '',
    
      tag_ids: []
    }),
    sqlSelectWriteFormBooks()
  ]);

  if (!page) notFound();
  
  return <WriteForm page={page} books={books} isUpdate={!!page_id}/>
}
export default WritePageIdPage;
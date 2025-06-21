import { notFound } from 'next/navigation';

import { isBooAuthorASF } from '@/app/lib/SF/afterAuthSFs';
import { isExistentBookIdSF, getBookTitleSF } from '@/app/lib/SF/publicSFs';
import { type SearchParams, parseSPVNaturalNumber, parseSPVOrderDirection } from '@/app/lib/utils';
import { Breadcrumbs } from '@/app/components/dynAuthorId/Breadcrumbs';
import { BookCriticalDropdown } from '@/app/components/dynAuthorId/BookCriticalDropdown';
import { SlipsModeSelector } from '@/app/components/atomic/SlipsModeSelector';
import { SlipsDirectionSelector } from '@/app/components/dynAuthorId/SlipsDirectionSelector';
import { InfiniteBooSlips } from '@/app/components/dynAuthorId/InfiniteBooSlips';
import { PaginationBooSlips } from '@/app/components/dynAuthorId/PaginationBooSlips';

const DynBookIdPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ authorId: string, bookId: string }>,
  searchParams: Promise<SearchParams>
}) => {
  const { authorId, bookId } = await params;
  const [ isExistentBookId, isReaderIsAuthor, bookTitle ] = await Promise.all([
    isExistentBookIdSF(bookId),
    isBooAuthorASF(bookId),
    getBookTitleSF(bookId)
  ]);
  if (!isExistentBookId) notFound();

  const sp = await searchParams;
  const p = parseSPVNaturalNumber(sp.p);
  const od = parseSPVOrderDirection(sp.od);

  const authorBookPath = `/@${authorId}/books`;
  const breadcrumbs = [
    {
      label: 'Books',
      href: authorBookPath,
      current: false,
      abled: true
    },
    {
      label: bookTitle,
      href: `/@${authorId}/books/${bookId}`,
      current: true,
      abled: false
    }
  ];

  return(
    <div className='flex flex-col py-[1.5rem]'>
      <div className='flex flex-row justify-between items-center'>
        <Breadcrumbs breadcrumbs={breadcrumbs} className='h-[3rem] text-[1.5rem] py-[0.5rem]'/>

        {isReaderIsAuthor
        && <BookCriticalDropdown
          bookId={bookId}
          className='h-[4rem] p-[0.5rem]'
        />}
      </div>
      
      <div className='flex flex-row justify-between items-center py-[0.5rem]'>
        <SlipsModeSelector currentValue={p} className='h-[2.5rem]'/>

        <SlipsDirectionSelector currentValue={od} className='h-[1.5rem]' />
      </div>
      
      {p
      ? <PaginationBooSlips
        p={p}
        searchReq={{bookId: bookId, orderDirectioin: od}}
        className='w-full py-[1.5rem]'
        itemsContainerClassName='divide-y-[0.1rem] divide-y-superdupersub'
        itemClassName="h-[17rem] py-[1rem]"
      />
      : <InfiniteBooSlips
        searchReq={{bookId: bookId, orderDirectioin: od}}
        className='w-full py-[1.5rem]'
        itemsContainerClassName='divide-y-[0.1rem] divide-y-superdupersub'
        itemClassName="h-[17rem] py-[1rem]"
      />}
    </div>
  );
}
export default DynBookIdPage;
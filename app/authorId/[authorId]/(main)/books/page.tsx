import { getAutBooksSF } from "@/app/lib/SFs/publicSFs";
import { Book } from "@/app/components/dynAuthorId/Book";
import { DefaultEmpty } from "@/app/components/leaves/InformDataState";

const DynAutBooksPage = async ({
  params
}: {
  params: Promise<{ authorId: string }>
}) => {
  const { authorId } = await params;

  const { autBooks } = await getAutBooksSF({authorId: authorId});
  
  if (autBooks.length === 0) {
    return <DefaultEmpty heading="No books yet." para='' />
  }
  
  return (
    <div className='grid grid-cols-books-grid justify-center gap-[3rem] py-[1.5rem]'>
      {autBooks.map(({book_id, book_title, pages_count}) => {
      return (
        <Book
          key={book_id}
          authorId={authorId}
          book_id={book_id}
          book_title={book_title}
          pages_count={pages_count}
          className="max-w-[20rem] w-full h-auto aspect-[4/3] p-[1rem]"
        />
      )})}
    </div>
  )
}
export default DynAutBooksPage;
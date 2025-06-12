import { type InitBook } from "@/app/lib/SFs/afterAuthSFs";
import { BookTitleIE } from '@/app/components/write/BookTitleIE';

type WriteBooksFormProps = {
  books: InitBook[];
  setBooks: React.Dispatch<React.SetStateAction<InitBook[]>>
  className?: string
}

export const WriteBooksForm = ({ books, setBooks, className }: WriteBooksFormProps) => {
  const onCreateBookTitle = (newBook: InitBook): void => {
    setBooks([newBook, ...books]);
  }

  const onUpdateBookTitle = (updatedBook: InitBook): void => {
    setBooks(books.map(book => 
      book.book_id === updatedBook.book_id 
      ? { ...book, book_title: updatedBook.book_title }
      : book
    ));
  }
  
  return (
    <div className={`flex flex-col ${className}`}>
      <BookTitleIE
        type="create"
        initBook={{book_id: '', book_title: ''}}
        onSubmitBookTitle={onCreateBookTitle}
        className="w-full py-[1rem]"
      />

      {books.length === 0
      ? <div className="text-[1.2rem] text-center p-[1rem]">No books yet.</div>
      : books.map((book) =>
        <BookTitleIE
          key={book.book_id}
          type="update"
          initBook={book}
          onSubmitBookTitle={onUpdateBookTitle}
          className="w-full py-[1rem]"
        />
      )}
    </div>
  );
}
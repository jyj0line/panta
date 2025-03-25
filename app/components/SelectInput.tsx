import { useToggleVisibility } from '@/app/lib/hooks';
import type { SelectedWriteFormPageType, SelectWriteFormBooksType } from '@/app/lib/sqls';
import { ArrowDropdownSvg } from '@/app/lib/svgs';

const NOT_IN_A_BOOK = 'not in a book';
type BookSelectProps = {
    books: SelectWriteFormBooksType;
    book_id: SelectedWriteFormPageType["book_id"];
    onBook_idChange: React.Dispatch<React.SetStateAction<string>>;
    name: string;
}
export const SelectInput = ({
    books,
    book_id,
    onBook_idChange,
    name,
}: BookSelectProps) => {
    const { isVisible, setIsVisible, ref } = useToggleVisibility();
  
    return(
        <div
            ref={ref}
            onClick={() => setIsVisible(prev => !prev)}
            className='relative flex flex-col justify-center w-full p-[0.25rem] rounded-[0.5rem]'
        >
            <div className='flex flex-row items-center cursor-pointer'>
                <input type="hidden" name={name} value={book_id ?? ''}></input>
                <div className='flex-1 p-[0.25rem]'>
                    {books.find(b => b.book_id === book_id)?.book_title  ?? NOT_IN_A_BOOK}
                </div>
                <ArrowDropdownSvg className='w-[2rem] h-[2rem]' />
            </div>
            {
            isVisible &&
            <ul className='absolute left-[0px] top-[100%] w-full flex flex-col bg-wh z-10 shadow-lg cursor-pointer'>
                <li onClick={() => onBook_idChange('')} className={`p-[0.25rem] ${book_id === '' ? 'bg-supersub' : ''}`}>
                    {NOT_IN_A_BOOK}
                </li>
                {books.map((book) => (
                <li key={book.book_id} onClick={() => onBook_idChange(book.book_id)} className={`p-[0.25rem] ${book_id === book.book_id ? 'bg-supersub' : ''}`}>
                    {book.book_title}
                </li>
                ))}
            </ul>
            }
        </div>
    )
}
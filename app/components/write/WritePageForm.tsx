import { type SelectWriteBooksRet } from "@/app/lib/SFs/afterAuthSFs";
import { TextareaInput } from '@/app/components/leaves/TextareaInput';
import { TokenInput } from '@/app/components/common/TokenInput';
import { SelectInput } from '@/app/components/leaves/SelectInput';
import { PAGE } from '@/app/lib/constants';

type WritePageFormProps = {
  page_id: string

  books: SelectWriteBooksRet
  book_id: string
  setBook_id: React.Dispatch<React.SetStateAction<string>>
  
  title: string
  setTitle: (title: string) => void

  preview: string
  setPreview: (preview: string) => void

  content: string
  setContent: (content: string) => void

  tag_ids: string[]
  setTag_ids: React.Dispatch<React.SetStateAction<string[]>>

  className?: string
}

export const WritePageForm = ({
  page_id,

  books,
  book_id,
  setBook_id,

  title,
  setTitle,

  preview,
  setPreview,

  content,
  setContent,

  tag_ids,
  setTag_ids,

  className
}: WritePageFormProps) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <input type="hidden" name="page_id" value={page_id} />

            <SelectInput
                name="book_id"
                options={books.map(book => ({
                    id: book.book_id,
                    title: book.book_title,
                }))}
                selectedOptionId={book_id}
                blankTitle='not in a book'
                onChange={setBook_id}
                className='h-[3.5rem] p-[1rem]'
            />

            <TextareaInput
                name="title"
                value={title}
                placeholder="title"
                maxLength={PAGE.PAGE_TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                className="text-[2rem] font-[600]"
            />

            <TextareaInput
                name="preview"
                value={preview}
                placeholder="preview"
                maxLength={PAGE.PAGE_PREVIEW_MAX}
                onChange={(e) => setPreview(e.target.value)}
            />
            
            <TokenInput
                name="tag_ids"
                tokens={tag_ids}
                setTokens={setTag_ids}
                placeholder={"tag"}
                className='bg-wh'
                tokensClassName='gap-[0.5rem] p-[0.5rem]'
                tokenClassName='token border-em'
                inputClassName='textarea w-full'
            />

            <TextareaInput
                name="content"
                value={content}
                placeholder="content"
                maxLength={PAGE.PAGE_CONTENT_MAX}
                onChange={(e) => setContent(e.target.value)}
                className='grow'
            />
        </div>
    )
}
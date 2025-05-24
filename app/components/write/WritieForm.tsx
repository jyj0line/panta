'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  type SelectWritePageRet,
  type SelectWriteBooksRet,
  createWriteASF,
  updateWriteASF
} from "@/app/lib/SFs/afterAuthSFs";
import { useToastBundleContext } from '@/app/lib/contexts/ToastBundleContext';
import { TextareaInput } from '@/app/components/leaves/TextareaInput';
import { TokenInput } from '@/app/components/leaves/TokenInput';
import { SelectInput } from '@/app/components/leaves/SelectInput';
import { WriteFormButtons } from '@/app/components/write/WriteFormButtons'

import { METADATA, PAGE, ERROR } from '@/app/lib/constants';
const {
  WRITE_TITLE_METADATA
} = METADATA;
const {
  PAGE_TITLE_MAX,
  PAGE_PREVIEW_MAX,
  PAGE_CONTENT_MAX
} = PAGE;
const {
  PLEASE_TRY_AGAIN_LATER_ERROR,

  CREATE_WRITE_SOMETHING_ERROR,
  UPDATE_WRITE_SOMETHING_ERROR
} = ERROR;

type WriteFormProps= {
  page: SelectWritePageRet,
  books: SelectWriteBooksRet
}
export const WriteForm = ({ page, books }: WriteFormProps) => {
  const { addToast } = useToastBundleContext();
  const { push } = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [title, setTitle] = useState<string>(page.title);
  const [preview, setPreview] = useState<string>(page.preview);
  const [tag_ids, setTag_ids] = useState<string[]>(page.tag_ids)
  const [content, setContent] = useState<string>(page.content);
  const [book_id, setBook_id] = useState<string>(page.book_id ?? '');

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting) {
      alert(PLEASE_TRY_AGAIN_LATER_ERROR);
      return;
    }

    setIsSubmitting(true);
    try {
      if (page.page_id) {
        const updateWriteRes = await updateWriteASF({
          page_id: page.page_id,
          title: title,
          preview: preview,
          tag_ids: tag_ids,
          content: content,
          book_id: book_id
        });

        if (updateWriteRes.success) {
          addToast({
            message: updateWriteRes.message,
            className: "bg-em",
            progressbarClassName: "bg-powerem"
          });
        } else {
          const errors = updateWriteRes.errors;
          if (errors) {
            Object.values(errors).map((errs) => {
              errs.map(e => {
                addToast({
                  message: e,
                  className: "bg-bad",
                  progressbarClassName: "bg-powerbad"
                })
              })
            })
          } else {
            addToast({
              message: updateWriteRes.message,
              className: "bg-bad",
              progressbarClassName: "bg-powerbad"
            })
          }
        }
      } else {
        const createWriteRes = await createWriteASF({
          title: title,
          preview: preview,
          tag_ids: tag_ids,
          content: content,
          book_id: book_id
        })

        if (createWriteRes.success) {
          push(`/write?page_id=${createWriteRes.page_id}`);
          addToast({
            message: createWriteRes.message,
            className: "bg-em",
            progressbarClassName: "bg-powerem"
          });
        } else {
          console.log(createWriteRes)
          const errors = createWriteRes.errors;
          if (errors) {
            Object.values(errors).map((errs) => {
              errs.map(e => {
                addToast({
                  message: e,
                  className: "bg-bad",
                  progressbarClassName: "bg-powerbad"
                })
              })
            })
          } else {
            addToast({
              message: createWriteRes.message,
              className: "bg-bad",
              progressbarClassName: "bg-powerbad"
            })
          }
        }
      }
    } catch(_) {
      if (page.page_id) {
        addToast({
          message: UPDATE_WRITE_SOMETHING_ERROR,
          className: "bg-bad",
          progressbarClassName: "bg-powerbad"
        });
      } else {
        addToast({
          message: CREATE_WRITE_SOMETHING_ERROR,
          className: "bg-bad",
          progressbarClassName: "bg-powerbad"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = (): void => {
    if (page.page_id) {
      push(`/${page.user_id}/${page.page_id}`);
    } else {
      push(`/${page.user_id}`);
    }
  };

  useEffect(() => {
    document.title = `${title} | Panta` || `${WRITE_TITLE_METADATA} | Panta`;
  }, [title]);

  return (
    <div className='container relative flex flex-col min-h-dvh bg-wh'>
      {/* write form bar start */}
      <div
        className='
          sticky top-[0px] flex flex-row items-center divide-x-[0.1rem] divide-sub
          bg-background h-[2.5rem] border-b-[0.1rem] border-sub
        '
      >
        <SelectInput
          name="book_id"
          options={books.map(book => ({
            id: book.book_id,
            title: book.book_title,
          }))}
          selectedOptionId={book_id}
          blankTitle='not in a book'
          onChange={setBook_id}
          className='h-full px-[1rem]'
        />
        <WriteFormButtons
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onExit={handleExit}
          className="h-full"
        />
      </div>
      {/* write form bar end */}

      {/* write form inputs start */}
      <div className='flex flex-col flex-1'>
        <input type="hidden" name="page_id" value={page.page_id} />

        <TextareaInput
          name="title"
          value={title}
          placeholder="title"
          maxLength={PAGE_TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          className="text-[2rem] font-[600]"
        />

        <TextareaInput
          name="preview"
          value={preview}
          placeholder="preview"
          maxLength={PAGE_PREVIEW_MAX}
          onChange={(e) => setPreview(e.target.value)}
        />
        
        <TokenInput
          name="tag_ids"
          tokens={tag_ids}
          setTokens={setTag_ids}
          placeholder={"tag"}
          className='bg-wh'
          tokensClassName='gap-[0.5rem] p-[0.5rem]'
          tokenClassName='p-[0.5rem] border-[0.1rem] border-em'
          inputClassName='textarea'
        />

        <TextareaInput
          name="content"
          value={content}
          placeholder="content"
          maxLength={PAGE_CONTENT_MAX}
          onChange={(e) => setContent(e.target.value)}
          className='grow'
        />
      </div>
      {/* write form inputs start */}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  type SelectWritePageRet,
  type SelectWriteBooksRet,
  createWriteASF,
  updateWriteASF
} from "@/app/lib/SF/afterAuthSFs";
import { TMUpdater } from '@/app/components/backgrounder/SearchTMUpdater';
import { makeToastOrder, useToastBundleContext } from '@/app/lib/context/ToastBundleContext';
import { type WriteMode, WriteModeSelector } from "@/app/components/write/WriteModeSelector";
import { WritePageForm } from '@/app/components/write/WritePageForm';
import { WriteBooksForm } from '@/app/components/write/WriteBooksForm';
import { WriteFormButtons } from '@/app/components/write/WriteFormButtons'

import { METADATA, ERROR } from '@/app/lib/constants';

const {
  WRITE_TITLE_METADATA
} = METADATA;

const {
  PLEASE_TRY_AGAIN_LATER_ERROR,

  CREATE_WRITE_SOMETHING_ERROR,
  UPDATE_WRITE_SOMETHING_ERROR
} = ERROR;

type WriteFormProps= {
  page: SelectWritePageRet,
  initBooks: SelectWriteBooksRet
}
export const WriteForm = ({ page, initBooks }: WriteFormProps) => {
  const { addToast } = useToastBundleContext();
  const { push } = useRouter();

  const [mode, setMode] = useState<WriteMode>("page");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [title, setTitle] = useState<string>(page.title);
  const [preview, setPreview] = useState<string>(page.preview);
  const [tag_ids, setTag_ids] = useState<string[]>(page.tag_ids)
  const [content, setContent] = useState<string>(page.content);
  const [book_id, setBook_id] = useState<string>(page.book_id ?? '');

  const [books, setBooks] = useState<SelectWriteBooksRet>(initBooks);

  const tmUpdaterDependency = title ? `${title} | Panta` : `${WRITE_TITLE_METADATA} | Panta`;

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
          addToast(makeToastOrder(updateWriteRes.message, true));
        } else {
          const errors = updateWriteRes.errors;
          if (errors) {
            Object.values(errors).map((errs) => {
              errs.map(e => {
                addToast(makeToastOrder(e, false));
              })
            })
          } else {
            addToast(makeToastOrder(updateWriteRes.message, false));
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
          addToast(makeToastOrder(createWriteRes.message, true));
        } else {
          const errors = createWriteRes.errors;
          if (errors) {
            Object.values(errors).map((errs) => {
              errs.map(e => {
                addToast(makeToastOrder(e, false));
            })})
          } else {
            addToast(makeToastOrder(createWriteRes.message, false));
          }
        }
      }
    } catch(e) {
      console.error(e);
      if (page.page_id) {
        addToast(makeToastOrder(UPDATE_WRITE_SOMETHING_ERROR, false));
      } else {
        addToast(makeToastOrder(CREATE_WRITE_SOMETHING_ERROR, false));
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

  return (
    <div className={'small_container relative flex flex-col min-h-dvh p-[0.5rem] bg-wh'}>
      {/* write form bar start */}
      <div
        className='
          sticky top-[0px] flex flex-row justify-between items-center divide-x-[0.1rem] divide-sub
          bg-wh h-[2.5rem] border-b-[0.1rem] border-sub z-[10]
        '
      >
        <WriteModeSelector
          currentMode={mode}
          onClickPage={() => { setMode("page") }}
          onClickBooks={() => { setMode("books") }}
          className='h-full'
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
      {mode === "page"
      ? <WritePageForm
        page_id={page.page_id}
        books={books}
        book_id={book_id}
        setBook_id={setBook_id}
        title={title}
        setTitle={setTitle}
        preview={preview}
        setPreview={setPreview}
        content={content}
        setContent={setContent}
        tag_ids={tag_ids}
        setTag_ids={setTag_ids}
        className="flex-1"
      />
      : <WriteBooksForm
        books={books}
        setBooks={setBooks}
        className="flex-1 self-center flex items-center w-full max-w-[30rem]"
      />}
      {/* write form inputs end */}

      <TMUpdater dependency={tmUpdaterDependency}/>
    </div>
  );
}
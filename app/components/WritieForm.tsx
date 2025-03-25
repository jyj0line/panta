'use client';
import { useState, useRef, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';

import { TextareaInput } from '@/app/components/TextareaInput';
import { TokenInput } from '@/app/components/TokenInput';
import { SelectInput } from '@/app/components/SelectInput';
import { InputError } from '@/app/components/InputError'
import { WriteFormButtons } from '@/app/components/WriteFormButtons'
import type { SelectedWriteFormPageType, SelectWriteFormBooksType } from '@/app/lib/sqls';
import { sqlCreatePageFromWriteForm, sqlUpdatePageFromWriteForm } from '@/app/lib/sqls'
import { PAGE } from '@/app/lib/constants';

const { PAGE_TITLE_MAX, PAGE_PREVIEW_MAX, PAGE_CONTENT_MAX } = PAGE;
type WriteFormProps= {
  page: SelectedWriteFormPageType,
  books: SelectWriteFormBooksType,
  isUpdate: boolean
}
export const WriteForm = ({ page, books, isUpdate }: WriteFormProps) => {
  ///dummy
  const auth = true;
  ///

  const action = isUpdate
    ? sqlUpdatePageFromWriteForm.bind(null, auth)
    : sqlCreatePageFromWriteForm.bind(null, auth);
  const [state, formAction, isPending] = useActionState(action, {});
  
  const [title, setTitle] = useState(page.title);
  const [preview, setPreview] = useState(page.preview);
  const [tag_ids, setTag_ids] = useState(page.tag_ids)
  const [content, setContent] = useState(page.content);
  const [book_id, setBook_id] = useState(page.book_id ?? '');

  const formRef = useRef<HTMLFormElement>(null);
  const { push } = useRouter();
  const handleSubmit = (): void => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };
  const handleExit = (): void => {
    isUpdate ? push(`/${page.user_id}/${page.page_id}`) : push(`/${page.user_id}`)
  };

  useEffect(() => {
    if (!page.page_id && state?.page_id) {
      push(`/write?page_id=${state.page_id}`);
    }
  }, [page.page_id, state?.page_id]);

  return (
    <form ref={formRef} action={formAction} className='container relative flex flex-col min-h-dvh'>
      {/* write form bar */}
      <div className='flex flex-row items-center sticky top-0 border-b-[0.1rem] border-sub bg-wh'>
        <div className="flex flex-col items-center grow">
          <SelectInput name="book_id" books={books} book_id={book_id} onBook_idChange={setBook_id} />
          <InputError name="book_id" errors={state?.errors?.book_id} />
        </div>
        <WriteFormButtons
          isPending={isPending}
          success={state?.success}
          message={state?.message}
          onSubmit={handleSubmit}
          onExit={handleExit}
        />
      </div>

      {/* write form inputs */}
      <div className='flex flex-col grow'>
        <input type="hidden" name="page_id" value={page.page_id} />

        <TextareaInput
          name="title"
          value={title}
          placeholder="title"
          maxLength={PAGE_TITLE_MAX - 1}
          onChange={(e) => setTitle(e.target.value)}
          className="text-[2rem] font-[600]"
        />
        <InputError name="title" errors={state?.errors?.title} />

        <TextareaInput
          name="preview"
          value={preview ?? ''}
          placeholder="preview"
          maxLength={PAGE_PREVIEW_MAX}
          onChange={(e) => setPreview(e.target.value)}
        />
        <InputError name="preview" errors={state?.errors?.preview} />
        
        <TokenInput tokens={tag_ids} setTokens={setTag_ids} type="tag" forSearch={false}/>
        <input type="hidden" name={"tag_ids"} value={JSON.stringify(tag_ids)} />
        <InputError name="tag_ids" errors={state?.errors?.tag_ids} />

        <TextareaInput
          name="content"
          value={content ?? ''}
          placeholder="content"
          maxLength={PAGE_CONTENT_MAX}
          onChange={(e) => setContent(e.target.value)}
          className='grow'
        />
        <InputError name="content" errors={state?.errors?.content} />
      </div>
    </form>
  );
}
'use client';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { InputError } from '@/app/components/InputError';
import { authenticate } from '@/app/lib/sqls';
import { USER } from '@/app/lib/constants';

const { USER_ID_MAX, USER_UNHASHED_PASSWORD_MAX } = USER;
export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="little-container flex flex-col p-[3rem]">
      <h1 className="text-[1.75rem] font-[500] m-[1rem]">
        Please log in to continue.
      </h1>

      <input
        type="text"
        name="user_id"
        maxLength={USER_ID_MAX}
        placeholder="Enter your ID"
        required
        className="w-full p-[1rem] rounded-[0.5rem] border-[0.1rem] border-supersub my-[0.1rem]"
      />

      <input
        type="password"
        name="unhashed_password"
        maxLength={USER_UNHASHED_PASSWORD_MAX}
        placeholder="Enter your password"
        required
        className="w-full p-[1rem] rounded-[0.5rem] border-[0.1rem] border-supersub my-[0.1rem]"
      />

      <input type="hidden" name="redirectTo" value={callbackUrl} />

      <InputError name="login" errors={[errorMessage ?? '']}/>

      <button
        type="submit"
        aria-disabled={isPending}
        className="p-[1rem] whitespace-nowrap rounded-md border-[0.1rem] border-supersub"
      >
        Log in
      </button>
    </form>
  );
}
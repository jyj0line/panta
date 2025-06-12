'use client';

import { useState, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { loginRedirectSF } from '@/app/lib/SFs/publicSFs';
import { TextInput } from '@/app/components/leaves/TextInput';
import { PasswordInput } from '@/app/components/leaves/PasswordInput';
import { CheckBox } from '@/app/components/leaves/CheckBox';
import { PrefixedMessage } from '@/app/components/leaves/PrefixedMessage';
import { IngButton } from '@/app/components/leaves/IngButton';

import { SpinnerSvg } from '@/app/lib/svgs';
import { USER } from '@/app/lib/constants';
const {
  USER_ID_MAX,
  USER_UNHASHED_PASSWORD_MAX
} = USER;

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [errorMessage, formAction, isPending] = useActionState(
    loginRedirectSF,
    undefined,
  );

  const [userId, setUserId] = useState<string>('');
  const [unhashedPassword, setUnhashedPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <form
      action={formAction}
      className={`
        tiny_container flex flex-col items-center gap-[1rem] max-w-[30rem] p-[1rem]
        ${isPending ? 'pointer-events-none' : ''}
      `}
    >
      {/* heading start */}
      <h1 className="text-[1.75rem] leading-[2.5rem] font-[500] p-[1rem]">
        Please login to continue.
      </h1>
      {/* heading end */}
      
      {/* form inputs start */}
      <div className='flex flex-col gap-[0.2rem] w-full'>
        <TextInput
          name="user_id"
          value={userId}
          placeholder="Enter your ID"
          readOnly={isPending}
          onChange={(e) => setUserId(e.target.value)}
          className='input'
        />

        <PasswordInput
          name="unhashed_password"
          showPassword={showPassword}
          value={unhashedPassword}
          placeholder="Enter your password"
          readOnly={isPending}
          onChange={(e) => setUnhashedPassword(e.target.value)}
          className='input'
        />
        <CheckBox
          label="Show password"
          isOn={showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
          className='h-[1.5rem]'
        />

        <input type="hidden" name="redirectTo" value={callbackUrl} />
      </div>
      {/* form inputs end */}
      
      {/* submit the form */}
      <div className='flex flex-col items-center gap-[0.1rem] w-full'>
        <PrefixedMessage name="login" messages={errorMessage?.message} className='text-bad'/>
        
        <IngButton
          id='login'
          type="submit"
          isIng={isPending}
          onClick={()=>{}}
          className="w-full bg-foreground text-background p-[1rem]"
        >
          Login
        </IngButton>
      </div>
    </form>
  );
}
import type { Metadata } from 'next';
import { SessionProvider } from "next-auth/react";

import { Logo } from '@/app/components/leaves/Logos';
import { SignUpForm } from "@/app/components/signup/SignUpForm";

export const metadata: Metadata = {
  title: 'Sign Up'
};

const SignUpPage = () => {
  return (
    <main className='flex flex-col justify-center items-center min-h-dvh m-[2rem]'>
      <Logo className='h-[3rem] m-[1rem]'/>
      <SessionProvider>
        <SignUpForm />
      </SessionProvider>
    </main>
  )
}
export default SignUpPage;
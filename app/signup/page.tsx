import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";

import { Logo } from '@/app/components/atomic/Logos';
import { SignUpForm } from "@/app/components/signup/SignUpForm";

const SignupPage = () => {
  return (
    <main className='flex flex-col justify-center items-center min-h-dvh m-[2rem]'>
      <Logo className='h-[3rem] m-[1rem]'/>
      <SessionProvider>
        <Suspense>
          <SignUpForm />
        </Suspense>
      </SessionProvider>
    </main>
  )
}
export default SignupPage;
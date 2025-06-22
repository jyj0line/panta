import { Suspense } from 'react';

import { Logo } from '@/app/components/atomic/Logos';
import { LoginForm } from "@/app/components/login/LoginForm"; 

const LoginPage = () => {
  return (
    <main className='flex flex-col justify-center items-center min-h-dvh bg-background'>
      <Logo className='h-[3rem] m-[1rem]'/>

      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
};
export default LoginPage;
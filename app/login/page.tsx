import Link from 'next/link'

import { LoginForm } from "@/app/components/LoginForm"; 
import { PantaSvg } from '@/app/lib/svgs';

const LoginPage = () => {
  return (
    <main className='flex flex-col justify-center items-center min-h-dvh bg-background'>
      <Link href='/'>
        <PantaSvg className="w-[8rem] h-auto m-[0.5rem]"/>
      </Link>

      <LoginForm />
    </main>
  )
}
export default LoginPage;
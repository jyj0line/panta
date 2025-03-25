import Link from 'next/link';

import { NotFoundSvg } from '@/app/lib/svgs';

const AppNotFound = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-[dvh]">
      <NotFoundSvg className="w-[3rem] h-[3rem] p-[1rem]" />
      <h2 className="text-[3rem] font-[600] p-[1rem]">404 Not Found</h2>
      <p className="p-[1rem]">Could not find the requested page.</p>
      <Link href="/" className="px-[1.5rem] py-[1rem] rounded-[0.5rem] text-background bg-em">
        Go to Main
      </Link>
    </main>
  );
}
export default AppNotFound;
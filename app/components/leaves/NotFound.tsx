import Link from 'next/link';

import { NotFoundSvg } from '@/app/lib/svgs';

export const NotFound = () => {
    return (
        <main className="flex flex-col items-center justify-center gap-[1rem] min-h-dvh">
            <NotFoundSvg className="w-[6rem] h-[6rem]" />
            <h2 className="text-[3rem] font-[600]">404 Not Found</h2>
            <p >Could not find the requested page.</p>
            <Link href="/" className="bg-em text-background px-[1.5rem] py-[1rem] rounded-[0.5rem]">
                Go to the Panta
            </Link>
        </main>
    )
}
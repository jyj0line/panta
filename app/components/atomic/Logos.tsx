import Link from 'next/link';

import { PantaSvg, SmallPantaSvg } from '@/app/lib/svgs';

type LogoProps = {
    className?: string
}
export const Logo = ({className="h-[2rem]"} : LogoProps) => {
    return(
        <Link href='/' className={className}>
            <PantaSvg className="w-auto h-full"/>
        </Link>
    )
}

type SmallLogoProps = {
    authorId: string
    className?: string
}
export const SmallLogo = ({authorId, className="2rem"} : SmallLogoProps) => {
    return(
        <div className={`flex flex-row items-center gap-[0.5rem] ${className}`}>
            <Link href='/' className='h-full'>
                <SmallPantaSvg className="w-auto h-full aspect-auto"/>
            </Link>
            <Link href={`/@${authorId}`} className="truncate">
                {authorId}
            </Link>
        </div>
    )
}
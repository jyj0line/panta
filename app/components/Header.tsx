import Link from 'next/link'

import UserDiv from '@/app/components/UserDiv'
import {PantaSvg, SimpleSearchSvg} from '@/app/lib/svgs'

///dummy
const isLogined = true;
///

type HeaderProps = {
    showSearch: boolean
}
const Header = ({showSearch}: HeaderProps) => {
    return (
        <header className='flex justify-between items-center w-full px-1 py-3'>
            <div className='flex justify-center items-center'>
                <Link href='/'>
                    <PantaSvg className='aspect-auto h-9'/>
                </Link>
            </div>
            {isLogined?
            <div className='flex flex-row gap-3'>
                {showSearch &&
                <Link href='/search'>
                    <SimpleSearchSvg className='w-8 h-8'/>
                </Link>
                }
                <UserDiv/>
            </div>
            :
            <div className='flex justify-center items-center gap-x-2'>
                <Link href='/' className='flex justify-center items-center h-9 p-4 rounded-full bg-sub'>Login</Link>
                <Link href='/' className='flex justify-center items-center h-9 p-4 rounded-full bg-sub'>Sign Up</Link>
            </div>
            }
      </header>
    )
}
export default Header;
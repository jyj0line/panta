import Link from 'next/link'

import UserDiv from '@/app/components/UserDiv'
import {Panta} from '@/app/lib/svgs'

///dummy
const isLogined = true;
///

const Header = () => {
    return (
        <header className='flex justify-between items-center w-full px-1 pt-4 pb-1'>
            <div className='flex justify-center items-center'>
                <Link href='/'>
                    <Panta className='aspect-auto h-9'></Panta>
                </Link>
            </div>
            {isLogined?
            <UserDiv/>
            :
            <div className='flex justify-center items-center gap-x-2'>
            <Link href='/' className='flex justify-center items-center h-9 p-4 rounded-full bg-green-100'>Login</Link>
            <Link href='/' className='flex justify-center items-center h-9 p-4 rounded-full bg-green-100'>Sign Up</Link>
            </div>
            }
      </header>
    )
}

export default Header;
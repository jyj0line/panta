'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link'

///dummy
const tabs = [
    { id: 'trend', href: '/trend'},
    { id: 'subscription', href: '/subscription' },
    { id: 'pagemark', href: '/pagemark' }
  ];
///

const TabBar = () => {
    const pathname = usePathname();
    const activePath = pathname === '/' ? '/trend' : pathname;

    return(
        <div className='flex justify-between items-center px-1'>
            <nav className='relative flex items-center gap-x-3'>
            {tabs.map(({id, href}) => (
            <Link key={id} href={href}
            className={
              'relative flex h-14 items-center justify-center gap-2 rounded-md px-3 text-md font-medium text-neutral-500' +
              (activePath === href
                ? 'text-foreground after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[0.25rem] after:bg-foreground after:rounded-full'
                : '')
            }>
              {id}
            </Link>
            ))}
            </nav>
            <div>right</div>
        </div>
    )
}

export default TabBar;
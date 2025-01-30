'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link'
import clsx from 'clsx';

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
        <div className='flex justify-between items-center px-1 pt-1 pb-4'>
            <nav className='relative flex items-center gap-x-3'>
            {tabs.map(({id, href}) => (
            <Link key={id} href={href}
              className={clsx(
              'relative flex h-12 items-center justify-center gap-2 rounded-md p-3 text-md font-medium text-neutral-500',
              {
                  'text-neutral-900 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[0.25rem] after:bg-neutral-900 after:rounded-full':
                      activePath === href,
              }
            )}>
              {id}
            </Link>
            ))}
            </nav>
            <div>right</div>
        </div>
    )
}

export default TabBar;
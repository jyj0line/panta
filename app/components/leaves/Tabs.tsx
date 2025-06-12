'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link'

export type Tab = {
  id: string;
  href: string;
  matchSubRoutes: boolean;
};

type TabsProps = {
  tabs: Tab[],
  className?: string;
};

export const Tabs = ({ tabs, className="h-[3rem]" }: TabsProps) => {
  const activePathname = usePathname();

  return(
    <nav className={`flex flex-row items-center ${className}`}>
    {tabs.map(({id, href, matchSubRoutes}) => (
      <Link
        key={id}
        href={href}
        className={`
          relative flex justify-center items-center h-full px-[1rem] py-[0.5rem]
          ${isActivePathname(href, activePathname, matchSubRoutes)
            ? 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[10%] after:rounded-full after:bg-foreground'
            : 'text-sub'}
        `}
      >
        {id}
      </Link>
    ))}
    </nav>
  )
};


const isActivePathname = (href: string, activePathname: string, matchSubRoutes: boolean) => {
  if (activePathname === href) return true;

  if (matchSubRoutes) {
    return activePathname.startsWith(href + '/');
  }

  return false;
};
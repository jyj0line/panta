'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link'

type Tab = {
  id: string;
  href: string;
}
type TabsProps = {
  tabs: Tab[],
  className?: string;
}
export const Tabs = ({ tabs, className="h-[3rem]" }: TabsProps) => {
  const pathname = usePathname();
  const activePath = pathname;

  return(
    <nav className={`flex flex-row items-center ${className}`}>
    {tabs.map(({id, href}) => (
      <Link
        key={id}
        href={href}
        className={`
          relative flex justify-center items-center h-full px-[1rem] py-[0.5rem]
          ${activePath === href
            ? 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[10%] after:rounded-full after:bg-foreground'
            : 'text-sub'}
        `}
      >
        {id}
      </Link>
    ))}
    </nav>
  )
}
'use client';

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link'

export type Tab = {
  id: string;
  href: string;
  matchSubRoutes: boolean;
  hasUpdate?: boolean
};

type TabsProps = {
  initTabs: Tab[],
  className?: string;
};

export const Tabs = ({ initTabs, className="h-[3rem]" }: TabsProps) => {
  const [tabs, setTabs] = useState<Tab[]>(initTabs);
  const activePathname = usePathname();

  const handleTabClick = (tabId: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, hasUpdate: false } : tab
      )
    );
  };

  useEffect(() => {
    setTabs(initTabs);
  }, [initTabs]);

  return(
    <nav className={`flex flex-row items-center ${className}`}>
    {tabs.map(({id, href, matchSubRoutes, hasUpdate}) => (
      <Link
        key={id}
        href={href}
        onClick={() => handleTabClick(id)}
        className={`
          relative flex justify-center items-center h-full px-[1rem] py-[0.5rem]
          ${isActivePathname(href, activePathname, matchSubRoutes)
            ? 'after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[10%] after:rounded-full after:bg-foreground'
            : 'text-sub'}
        `}
      >
        <span className="relative">
          {id}
          {hasUpdate && <span className="absolute -right-[0.5rem] w-auto h-[20%] aspect-square bg-em rounded-full"></span>}
        </span>
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
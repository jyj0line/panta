import Image from "next/image";
import Link from 'next/link';

import { HorScrollDiv } from "@/app/components/divs/HorScrollDiv";

import { DEFAULT } from "@/app/lib/constants";

export type Breadcrumb = {
  imageUrl?: string | null;
  label: string;
  href: string;
  current: boolean;
  abled: boolean;
}

type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb[],
  className?: string
}

export const Breadcrumbs= ({ breadcrumbs, className="h-[3rem]" }: BreadcrumbsProps) => {
  return (
    <HorScrollDiv
      aria-label="Breadcrumb"
      scrollSpeed={1}
      className={`flex flex-row items-center gap-[0.5rem] hide_scrollbar ${className}`}
    >
      <ol className='flex flex-row items-center gap-[0.5rem] h-full'>
        {breadcrumbs.map((breadcrumb, index) => (
        <li
          key={breadcrumb.label}
          aria-current={breadcrumb.current}
          className={`flex flex-row items-center gap-[0.5rem] h-full ${breadcrumb.current ? 'text-foreground' : 'text-sub'}`}
        >
          {breadcrumb.abled
          ? <Link href={breadcrumb.href} className='flex flex-row items-center gap-[0.5rem] h-full whitespace-nowrap'>
              {breadcrumb.imageUrl !== undefined
              ? <div className="relative w-auto h-full aspect-square">
                  <Image
                      src={breadcrumb.imageUrl ?? DEFAULT.DEFAULT_PROFILE_IMAGE_URL}
                      alt='author profile image'
                      fill
                      sizes="20vw"
                      className="object-cover rounded-full bg-supersub"
                  />
                </div>
              : null}
              {breadcrumb.label}
            </Link>
          : <span className="whitespace-nowrap">{breadcrumb.label}</span>}
          {index < breadcrumbs.length - 1
          ? <span>›</span>
          : null}
        </li>
        ))}
      </ol>
    </HorScrollDiv>
  );
}
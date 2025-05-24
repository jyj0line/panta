import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link';

import type {CardType} from '@/app/lib/sqls'
import {LikeSvg, ViewOnSvg as ViewSvg} from "@/app/lib/svgs"
///tmp
import a from '@/public/a.png'
///tmp

export const Card = memo(({ card }: { card: CardType }) => {
  return (
    <div className='flex flex-col justify-center aspect-[6/7] hover:translate-y-[-0.5rem] duration-300 shadow-md bg-background'>
      <Link href={`/${card.user_id}/${card.page_id}`} className='flex-1 relative'>
          <Image alt='a' src={a} fill sizes='100dvw' className='object-cover'/>
      </Link>
      <div className='p-[1rem]'>
        <Link href={`/${card.user_id}/${card.page_id}`}>
          <p className='font-semibold'>{card.title}</p>
          <p className='h-[6rem] line-clamp-3 word-break break-words hyphens-auto text-[0.9rem] leading-[1.5rem] py-[0.5rem] font-[300] text-sub'>{card.preview}</p>
          <div className='font-[300] text-[0.7rem] text-sub'>{card.created_at.toDateString()}</div>
        </Link>
        <div className='flex flex-row justify-between'>
          <Link href={`/${card.user_id}`}>{card.user_id}</Link>
          <div className='flex flex-row items-center'>
            <div className='flex flex-row items-center'>
              <ViewSvg/>
              {card.view}
            </div>
            <div className='flex flex-row items-center'>
              <LikeSvg/>
              {card.like}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.card.page_id === nextProps.card.page_id
});

export const CardLoading = () => {
  return (
    <div className='flex flex-col justify-center aspect-[6/7] shadow-md bg-background'>
        <div className='flex-1 skeleton'/>
        <div className='flex flex-col p-[1rem]'>
          <p className='w-[50%] h-[1rem] m-[0.25rem] skeleton'/>
          <p className='w-[90%] h-[5rem] m-[0.25rem] skeleton'/>
          <div className='w-[40%] h-[1rem] m-[0.25rem] skeleton'/>
          <div className='flex flex-row justify-between'>
            <div className='w-[20%] h-[1rem] m-[0.25rem] skeleton'/>
            <div className='flex flex-row justify-end w-[80%]'>
              <div className='w-[20%] h-[1rem] m-[0.25rem] skeleton'/>
              <div className='w-[20%] h-[1rem] m-[0.25rem] skeleton'/>
            </div>
          </div>
        </div>
      </div>
  );
}
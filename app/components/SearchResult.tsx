import { memo } from 'react'
import Link from 'next/link';
import Image from 'next/image'

import { SearchResultType } from '@/app/lib/sqls';
import {  ViewSvg, LikeSvg } from "@/app/lib/svgs"

///tmp
import a from '@/public/a.png'
///tmp

export const SearchResult = memo(({page_id, title, preview, created_at, view, like, user_id, tag_ids}: SearchResultType) => {
    return (
        <div className='flex flex-row'>
            <div className='flex flex-col w-[80%] py-[2rem] gap-[0.5rem]'>
                <Link href={`/${user_id}/${page_id}`} className="flex flex-col gap-y-[0.5rem]">
                    <p className='leading-[2rem] text-[1.2rem] font-[500] truncate'>{title}</p>
                    <p className='h-[3rem] p-[0.25rem] line-clamp-2 word-break break-words hyphens-auto text-[1rem] leading-[1.2rem] font-[300] text-sub'>{preview}</p>
                    <p className="h-[3rem]"></p>
                </Link>
                <div className='flex flex-row overflow-x-auto whitespace-nowrap space-x-[0.5rem] hide-scrollbar'>
                    {tag_ids.map((tag_id) => (
                    <Link href={`/search?tag=${tag_id}`} key={tag_id} className='p-[0.3rem] rounded-[0.5rem] border-[0.1rem] border-em text-[1rem]'>
                        {tag_id}
                    </Link>
                    ))}
                </div>
                <div className='flex flex-row justify-between items-center'>
                    <Link href={`/${user_id}`} className="p-[0.25rem] text-[1rem]">{user_id}</Link>
                    <div className='flex flex-row items-center text-[1rem]'>
                        <div className="flex flex-row items-center p-[0.25rem]">{created_at.toDateString()}</div>
                        <span className='p-[0.3rem]'>·</span>
                        <div className="flex flex-row items-center p-[0.25rem] gap-x-[0.2rem]"><ViewSvg className="w-[1rem] h-[1rem]"/>{view}</div>
                        <span className='p-[0.3rem]'>·</span> 
                        <div className="flex flex-row items-center p-[0.25rem] gap-x-[0.2rem]"><LikeSvg className="w-[1rem] h-[1rem]"/>{like}</div>
                    </div>
                </div>
            </div>
            <Link href={`/${user_id}/${page_id}`} className='relative flex-1 m-[1rem]'>
              <Image alt='a' src={a} fill sizes='100dvw' className='object-cover'/>
            </Link>
        </div>
      );
    }, (prevProps, nextProps) => {
      return prevProps.page_id === nextProps.page_id 
});

export const SearchResultSkeleton = () => {
    return (
        <div className='flex flex-row'>
            <div className='flex flex-col w-[80%] py-[2rem] gap-[0.5rem]'>
                <div className="flex flex-col gap-y-[0.5rem]">
                    <p className='w-[50%] h-[1.7rem] skeleton'/>
                    <p className='w-[90%] h-[4rem] skeleton'/>
                    <p className="h-[3rem]"></p>
                </div>
                <div className='flex flex-row space-x-[0.5rem]'>
                    {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='w-[20%] h-[1.7rem] rounded-[0.5rem] skeleton'/>
                    ))}
                </div>
                <div className='flex flex-row justify-between items-center'>
                    <div className="w-[20%] h-[1rem] m-[0.25rem] skeleton"/>
                    <div className='flex flex-row justify-end items-center w-[80%]'>
                        <div className="w-[10%] h-[1rem] m-[0.25rem] skeleton"/>
                        <div className="w-[10%] h-[1rem] m-[0.25rem] skeleton"/>
                        <div className="w-[10%] h-[1rem] m-[0.25rem] skeleton"/>
                    </div>
                </div>
            </div>
            <div className='flex flex-1 m-[0.5rem]'>
              <div className='flex-1 skeleton'/>
            </div>
        </div>
    );
}

export const SearchResultError = () => {
    return (
        <div className='flex justify-center items-center w-full h-[8rem]'>
            <span>Something went wrong.</span>
        </div>
    );
}
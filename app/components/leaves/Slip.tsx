import { memo } from "react";
import Image from 'next/image';
import Link from "next/link";

import { type GetSlipsRes } from "@/app/lib/SFs/publicSFs";
import { HorScrollDiv } from "@/app/components/leaves/HorScrollDiv";
import { ViewOnSvg, LikeSvg } from '@/app/lib/svgs';

import { DEFAULT } from "@/app/lib/constants";

export type SlipProps = Pick<GetSlipsRes, 'page_id' | 'created_at' | 'title' | 'preview' | 'user_id'> & {
  profile_image_url?: string | null;

  view?: number;
  like?: number;
  
  tag_ids?: string[];

  showAuthorInfo?: boolean

  className?: string;
}

export const Slip = memo(({
  page_id,
  title,
  preview,
  tag_ids,
  view,
  like,
  created_at,
  user_id,
  profile_image_url,
  showAuthorInfo=true,
  className
}: SlipProps) => {
  const showAuthorInfoConfirmed = showAuthorInfo && user_id && profile_image_url;

  return (
    <div className={`flex flex-col py-[1.5rem] ${className}`}>
      <Link href={`/@${user_id}/${page_id}`} className="flex flex-col h-[10rem] py-[0.5rem]">
          <p className='text-[1.3rem] truncate font-[500] py-[0.5rem]'>
            {title}
          </p>
          <p className='line-clamp-2 break-words font-[300] text-sub py-[0.5rem]'>
            {preview}
          </p>
      </Link>

      {tag_ids &&
      <HorScrollDiv
        scrollSpeed={1}
        className="flex flex-row items-center gap-[0.5rem] h-[4rem] py-[0.5rem] hide_scrollbar"
      >
          {tag_ids.map((tag_id) => (
          <Link
            key={tag_id}
            href={`/search?tag=${tag_id}`}
            className='flex justify-center items-center min-w-[2rem] token border-em'
          >
            {tag_id}
          </Link>
          ))}
      </HorScrollDiv>}
      
      <div className='flex flex-row justify-between items-center h-[3rem] py-[0.5rem]'>
        
        <div className='flex flex-row items-center h-full'>
          {showAuthorInfoConfirmed &&
          <>
          <div className="relative w-auto h-full aspect-square">
            <Image
              src={profile_image_url ?? DEFAULT.DEFAULT_PROFILE_IMAGE_URL}
              alt={`${user_id}'s profile image`}
              fill
              sizes="33vw"
              className="object-cover rounded-full bg-supersub"
            />
          </div>

          <Link href={`/@${user_id}`} className='px-[0.5rem]'>{user_id}</Link>
          </>}
        </div>

        <div className='flex flex-row items-center h-full text-sub'>
          <div className="flex flex-row items-center px-[0.5rem]">{created_at}</div>
          {view !== undefined &&
          <>
          <span>·</span>
          <div className="flex flex-row items-center h-full px-[0.5rem]">
            <ViewOnSvg className="w-auto h-[60%] aspect-auto px-[0.2rem]"/>
            <span>{view}</span>
          </div>
          </>}
          {like !== undefined &&
          <>
            <span>·</span>
            <div className="flex flex-row items-center h-full px-[0.5rem]">
              <LikeSvg className="w-auto h-[60%] aspect-auto px-[0.2rem]"/>
              <span>{like}</span>
            </div>
          </>}
        </div>
      </div>
  </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.page_id === nextProps.page_id 
});





type SlipsSkeletonProps = {
    limit: number
    showAuthorInfo?: boolean
    className?: string
}

export const SlipsSkeleton = ({
    limit,
    showAuthorInfo=true,
    className
}: SlipsSkeletonProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
        {Array.from({ length: limit }).map((_, idx) => (
        <div key={idx} className='flex flex-col \ py-[1.5rem]'>
            <div className='h-[10rem] py-[0.5rem]'>
                <div className='h-[35%]'>
                <div className='max-w-[7rem] h-[80%] skeleton'></div>
                </div>

                <div className='h-[65%] py-[0.5rem]'>
                <div className='h-[50%]'>
                    <div className='w-full h-[80%] skeleton'></div>
                </div>
                <div className='h-[50%]'>
                    <div className='w-full h-[80%] skeleton'></div>
                </div>
                </div>
            </div>

            <div className='flex flex-row items-center gap-[0.5rem] h-[4rem] py-[0.5rem] overflow-x-hidden'>
                <div className='w-[2rem] h-[80%] token border-[0rem] skeleton'></div>
                <div className='w-[6rem] h-[80%] token border-[0rem] skeleton'></div>
                <div className='w-[3rem] h-[80%] token border-[0rem] skeleton'></div>
            </div>

            <div className='flex flex-row justify-between items-center h-[3rem] py-[0.5rem]'>
              <div className='flex flex-row items-center h-full'>
                {showAuthorInfo &&
                <>
                <div className="w-auto h-full aspect-square skeleton rounded-full"></div>
            
                <div className='flex justify-center items-center h-full px-[0.5rem]'>
                    <div className='w-[5rem] h-[60%] skeleton'></div>
                </div></>}
              </div>

              <div className='flex flex-row items-center h-full'>
                <div className="flex justify-center items-center h-full px-[0.5rem]">
                    <div className='w-[8rem] h-[60%] skeleton'></div>
                </div>

                <div className="flex flex-row items-center h-full px-[0.5rem]">
                    <div className="flex justify-center items-center h-full px-[0.2rem]">
                    <div className="w-[2rem] h-[60%] px-[0.2rem] skeleton"></div>
                    </div>

                    <div className='w-[3rem] h-[60%] skeleton'></div>
                </div>

                <div className="flex flex-row items-center h-full px-[0.5rem]">
                    <div className="flex justify-center items-center h-full px-[0.2rem]">
                    <div className="w-[2rem] h-[60%] px-[0.2rem] skeleton"></div>
                    </div>

                    <div className='w-[3rem] h-[60%] skeleton'></div>
                </div>
              </div>
            </div>
        </div>))}
    </div>
  )
}
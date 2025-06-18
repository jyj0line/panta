import { memo } from "react";
import Image from 'next/image';
import Link from "next/link";

import { type GetSlipsRes } from "@/app/lib/utils";
import { HorScrollDiv } from "@/app/components/divs/HorScrollDiv";
import { ViewOnSvg, LikeSvg } from '@/app/lib/svgs';

import { DEFAULT } from "@/app/lib/constants";

export type SlipProps = Pick<GetSlipsRes, 'page_id' | 'title' | 'preview' | 'user_id'> & {
  profile_image_url?: string | null;

  view?: number;
  like?: number;
  created_at?: string;
  updated_at?: string;

  tag_ids?: string[]

  showAuthorInfo?: boolean
  showCreadtedAtOrUpdatedAt?: "created_at" | "updated_at"

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
  updated_at,
  user_id,
  profile_image_url,
  showAuthorInfo=true,
  showCreadtedAtOrUpdatedAt="created_at",
  className="h-[15rem]"
}: SlipProps) => {
  const showAuthorInfoConfirmed = showAuthorInfo && user_id && profile_image_url !== undefined;
  const isShowingTagIds = tag_ids && tag_ids.length > 0;

  return (
    <div className={`flex flex-col ${className}`}>
      <Link href={`/@${user_id}/${page_id}`} className='flex-1 flex flex-col py-[0.5rem]'>
          <p className='text-[1.3rem] truncate font-[500] py-[0.5rem]'>
            {title}
          </p>
          <p className='line-clamp-2 break-words font-[300] text-sub'>
            {preview}
          </p>
      </Link>

      {isShowingTagIds &&
      <HorScrollDiv
        scrollSpeed={1}
        className="flex flex-row items-center gap-[0.5rem] h-[25%] py-[0.5rem] hide_scrollbar"
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
      
      {showAuthorInfoConfirmed &&
      <HorScrollDiv
        scrollSpeed={1}
        className="h-[15%] py-[0.1rem] hide_scrollbar"
      >
        <Link href={`/@${user_id}`} className="flex flex-row items-center h-full">
          <div className="relative w-auto h-[80%] aspect-square">
            <Image
              src={profile_image_url ?? DEFAULT.DEFAULT_PROFILE_IMAGE_URL}
              alt={`${user_id}'s profile image`}
              fill
              sizes="33vw"
              className="object-cover rounded-full bg-supersub"
            />
          </div>

          <div className='px-[0.5rem]'>
            {user_id}
          </div>
        </Link>
      </HorScrollDiv>}

      <div className='self-end flex flex-row items-center h-[10%] text-sub py-[0.1rem]'>
        <div className="
          flex flex-row items-center px-[0.5rem]">
          {showCreadtedAtOrUpdatedAt === "created_at"
          ? created_at ?? '-' : updated_at ?? '-'}
        </div>

        {view !== undefined &&
        <>
        <span>·</span>
        <div className="flex flex-row items-center gap-[0.2rem] h-full px-[0.5rem]">
          <ViewOnSvg className="w-auto h-[80%] aspect-auto"/>
          <span>{view}</span>
        </div>
        </>}

        {like !== undefined &&
        <>
          <span>·</span>
          <div className="flex flex-row items-center gap-[0.2rem] h-full px-[0.5rem]">
            <LikeSvg className="w-auto h-[80%] aspect-auto"/>
            <span>{like}</span>
          </div>
        </>}
      </div>
  </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.page_id === nextProps.page_id 
});





export type SlipSkeletonProps = {
    showAuthorInfo?: boolean
    className?: string
}

export const SlipSkeletion = ({
    showAuthorInfo=true,
    className
}: SlipSkeletonProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`${showAuthorInfo ? "h-[50%]" : "h-[65%]"} py-[0.5rem]`}>
          <div className='h-[35%] pt-[0.3rem]'>
            <div className='max-w-[7rem] h-[100%] skeleton'></div>
          </div>

          <div className='h-[65%] py-[0.5rem]'>
            <div className='h-[50%]'>
                <div className='w-full h-[85%] skeleton'></div>
            </div>
            <div className='h-[50%]'>
                <div className='w-[50%] h-[85%] skeleton'></div>
            </div>
          </div>
      </div>

      <div className='flex flex-row items-center gap-[0.3rem] h-[25%] py-[0.5rem] overflow-x-hidden'>
          <div className='w-[20%] max-w-[2rem] h-[80%] token border-[0rem] skeleton'></div>
          <div className='w-[40%] max-w-[6rem] h-[80%] token border-[0rem] skeleton'></div>
          <div className='w-[30%] max-w-[3rem] h-[80%] token border-[0rem] skeleton'></div>
      </div>

      {showAuthorInfo &&
      <div className="flex flex-row items-center gap-[0.5rem] h-[15%] py-[0.1rem]">
        <div className="w-auto h-[80%] aspect-square rounded-full skeleton"></div>
    
        <div className='w-full max-w-[5rem] h-[60%] skeleton'></div>
      </div>}

      <div className='self-end flex flex-row items-center w-[50%] max-w-[10rem] h-[10%] py-[0.1rem]'>
        <div className="flex-2 flex justify-center items-center h-full px-[0.2rem]">
            <div className='w-full max-w-[8rem] h-[80%] skeleton'></div>
        </div>

        <div className="flex-1 flex flex-row items-center h-full px-[0.2rem]">
            <div className='w-full max-w-[5rem] h-[80%] skeleton'></div>
        </div>

        <div className="flex-1 flex flex-row items-center h-full px-[0.2rem]">
            <div className='w-full max-w-[3rem] h-[80%] skeleton'></div>
        </div>
      </div>
    </div>
  )
}
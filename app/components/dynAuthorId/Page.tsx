
import Image from "next/image";
import Link from "next/link";

import { isPagAuthorASF } from "@/app/lib/SF/afterAuthSFs";
import { type GetPageParam, getPageSF } from "@/app/lib/SF/publicSFs";
import { PageCriticalDropdown } from "@/app/components/dynAuthorId/PageCriticalDropdown";
import { BookSvg, ViewOnSvg, LikeSvg } from "@/app/lib/svgs";
import { DEFAULT } from "@/app/lib/constants";

type PageProps = {
    pageId: GetPageParam
    className?: string
};

export const Page = async ({
  pageId,
  className
}: PageProps) => {
  const [page, isAuthor] = await Promise.all([getPageSF(pageId), isPagAuthorASF(pageId)]);

  if (!page) return (
    <div className={`flex justify-center items-center ${className}`}>
      Failed to fetch the page.
    </div>
  );

  const {
    book_id, book_title, title, preview, tag_ids,
    user_id, profile_image_url, created_at, updated_at, view, like, content
  } = page;

  return (
  <div className={`relative flex flex-col ${className}`}>
    {book_id &&
    <Link href={`/@${user_id}/books/${book_id}`} className="flex flex-row items-center max-w-fit h-[3.5rem] p-[1rem]">
      <BookSvg className="w-auto h-[80%] aspect-auto pr-[0.2rem]" />
      <span>{book_title}</span>
    </Link>}

    <div className="text-[2rem] font-[600] p-[1rem]">
      {title}
    </div>
    
    {preview.length > 0 &&
    <div className="p-[1rem]">
      {preview}
    </div>}

    {tag_ids.length > 0 &&
    <div className="flex flex-row flex-wrap gap-[0.5rem] p-[1rem]">
      {tag_ids.map(tagId => {
        return (
        <Link key={tagId} href={`/search?tag=${tagId}`} className="token border-em">
          {tagId}
        </Link>)
      })}
    </div>}
    
    <Link href={`/@${user_id}`} className="flex flex-row items-center h-[4rem] p-[1rem]">
      <div className="relative w-auto h-full aspect-square">
        <Image
          src={profile_image_url ?? DEFAULT.DEFAULT_PROFILE_IMAGE_URL}
          alt={`${user_id}'s profile image`}
          fill
          sizes="33vw"
          className="object-cover rounded-full bg-supersub"
        />
      </div>

      <div className='px-[0.5rem]'>{user_id}</div>
    </Link>

    <div className='self-end flex flex-row items-center h-[4rem] p-[1rem] text-sub'>
      <div className="flex flex-row items-center px-[0.5rem]">{created_at}</div>

      <span>·</span>

      {created_at !== updated_at &&
      <>
      <div className="flex flex-row items-center px-[0.5rem]">{updated_at}</div>

      <span>·</span>
      </>}

      <div className="flex flex-row items-center gap-[0.2rem] h-full px-[0.5rem]">
        <ViewOnSvg className="w-auto h-[60%] aspect-auto"/>
        <span>{view}</span>
      </div>

      <span>·</span>

      <div className="flex flex-row items-center gap-[0.2rem] h-full px-[0.5rem]">
        <LikeSvg className="w-auto h-[60%] aspect-auto"/>
        <span>{like}</span>
      </div>

      {isAuthor &&
      <PageCriticalDropdown pageId={pageId} className="h-[2.5rem]"/>}
    </div>

    <div className="p-[1rem]">
      {content}
    </div>
  </div>
  );
}
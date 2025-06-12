import Link from "next/link";

import { isPagAuthorASF } from "@/app/lib/SFs/afterAuthSFs";
import { type GetPageParam, getPageSF } from "@/app/lib/SFs/publicSFs";

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
    page_id, book_id, book_title, title, preview, tag_ids,
    user_id, created_at, updated_at, view, like, content
  } = page;

  return (
  <div className={`flex flex-col ${className}`}>
    {book_id &&
    <Link href={`/@${user_id}/books/${book_id}`} className="h-[3.5rem] p-[1rem]">
      {book_title}
    </Link>}

    <div className="text-[2rem] font-[600] p-[1rem]">
      {title}
    </div>

    <div className="p-[1rem]">
      {preview}
    </div>

    {tag_ids.length > 0 &&
    <div className="flex flex-row flex-wrap gap-[0.5rem] p-[0.5rem]">
      {tag_ids.map(tagId => {
        return (
        <Link key={tagId} href={`/search?tag=${tagId}`} className="token border-em">
          {tagId}
        </Link>)
      })}
    </div>}

    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row items-center">
        {/* <div>{userId}</div>
        {isLogined && 'follow'}
        {!isLogined && 'rewrite delete'} */}
      </div>

      <div className="flex flex-row items-center">
        <div>view</div>
        <div>like will be clickable.</div>
      </div>
    </div>

    <div className="p-[1rem]">
      {content}
    </div>
  </div>
  );
}
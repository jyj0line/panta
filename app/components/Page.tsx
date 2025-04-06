import type { PageType } from "@/app/lib/sqls";
type PageProps = {
    pageId: PageType["page_id"]
}
export const Page = () => {
    return (
    <div className="flex flex-col p-[1rem]">
      <div className="flex flex-col">
        <div className="leading-[4rem] text-[3rem] font-[600] py-[0.5rem]">title</div>
        <div>preivew</div>
        <div>createdAt</div>

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
        
        <div>tags</div>
      </div>

      <div>
        content
      </div>
    </div>
    );
}
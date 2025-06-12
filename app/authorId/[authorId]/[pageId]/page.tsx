import { Page } from "@/app/components/dynAuthorId/Page";
import { BooPageTurner, AutPageTurner } from "@/app/components/dynAuthorId/PageTurner";
import { StickyDiv } from '@/app/components/divs/StickyDiv';
import { PageViewUpdater } from "@/app/components/backgrounder/PageViewUpdater";

const DynPageIdPage = async ({
  params,
}: {
  params: Promise<{ authorId: string; pageId: string; }>
}) => {
  const { authorId, pageId } = await params;

  return (
    <div className='relative flex-1 flex flex-col'>
      <Page
        pageId={pageId}
        className="flex-1 small_container p-[0.5rem]"
      />

        {/* <CottonCandy
          authorId={authorId}
        /> */}

      <StickyDiv type="bottom">
        <BooPageTurner curPageId={pageId} className='little_container h-[2.5rem] p-[0.5rem]'/>
        <AutPageTurner curPageId={pageId} className='little_container h-[2.5rem] p-[0.5rem]'/>
      </StickyDiv>

      <PageViewUpdater pageId={pageId} />
    </div>
  )
}
export default DynPageIdPage;
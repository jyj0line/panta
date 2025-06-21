import { Page } from "@/app/components/dynAuthorId/Page";
import { BooPageTurner, AutPageTurner } from "@/app/components/dynAuthorId/PageTurner";
import { BubbleDiv } from "@/app/components/div/BubbleDiv";
import { StickyDiv } from '@/app/components/div/StickyDiv';
import { PageViewUpdater } from "@/app/components/backgrounder/PageViewUpdater";
import { ClapPad } from "@/app/components/dynAuthorId/ClapPad";

const DynPageIdPage = async ({
  params,
}: {
  params: Promise<{ authorId: string; pageId: string; }>
}) => {
  const { authorId, pageId } = await params;

  return (
    <div className='relative flex-1 flex flex-col w-full'>
      <BubbleDiv
        bubblableClassName="flex-1"
        className="small_container p-[0.5rem]"
        bubbles={<ClapPad pageId={pageId} authorId={authorId} className="gap-[0.5rem] w-[2.5rem] h-[5.5rem]" />}
        bubblesClassName="top-[50%] left-[100%] -translate-x-[3rem] min-[1024px]:translate-x-[5rem] translate-y-[5.5rem]"
      >
        <Page
          pageId={pageId}
          className="w-full"
        />
      </BubbleDiv>

      <StickyDiv direction="bottom" isStickyEffect={false}>
        <BooPageTurner curPageId={pageId} className='little_container h-[2.5rem] p-[0.5rem]'/>
        <AutPageTurner curPageId={pageId} className='little_container h-[2.5rem] p-[0.5rem]'/>
      </StickyDiv>

      <PageViewUpdater pageId={pageId} />
    </div>
  )
}
export default DynPageIdPage;
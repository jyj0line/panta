import { getAuthenticatedUserASF, type GetSubscribesReq } from "@/app/lib/SF/afterAuthSFs";
import { getAuthorCrumbDataSF } from "@/app/lib/SF/publicSFs";
import { getSubscribeCrumbs } from "@/app/lib/utils";
import { Breadcrumbs } from "@/app/components/dynAuthorId/Breadcrumbs";
import { InfiniteSubscribes } from "@/app/components/dynAuthorId/InfiniteSubscribes";

const ED_OR_ING: GetSubscribesReq["edOrIng"] = 'subscribing';

const SubscribingPage = async ({
  params
}: {
  params: Promise<{ authorId: string }>
}) => {
  const {authorId} = await params;
  const [authorCrumbDataState, reader] = await Promise.all([
    getAuthorCrumbDataSF(authorId),
    getAuthenticatedUserASF()
  ]);
  const isLoggedIn = reader !== null;

  if (!authorCrumbDataState.success) {
    return (
      <p className="flex-1 flex justify-center items-center">Failed to get the {ED_OR_ING} page</p>
    )
  }

  return (
    <div className="flex-1 flex flex-col small_container p-[2rem]">
        <Breadcrumbs
          breadcrumbs={getSubscribeCrumbs({
            authorId: authorCrumbDataState.authorCrumbData.user_id,
            profileImageUrl: authorCrumbDataState.authorCrumbData.profile_image_url,
            subscribe: ED_OR_ING
          })}
          className="h-[3rem] text-[1.5rem] py-[0.5rem]"
        />

        <InfiniteSubscribes
          authorId={authorCrumbDataState.authorCrumbData.user_id}
          edOrIng={ED_OR_ING}
          isLoggedIn={isLoggedIn}
          className="flex-1 gap-[0.5rem] py-[0.5rem]"
          itemsContainerClassName="flex flex-col"
        />
    </div>
  )
}
export default SubscribingPage;
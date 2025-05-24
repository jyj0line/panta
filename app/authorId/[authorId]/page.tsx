import { getAuthenticatedUserASF } from "@/app/lib/SFs/afterAuthSFs";
import { getAuthorCardDataSF } from "@/app/lib/SFs/publicSFs";

import { AuthorCard } from "@/app/components/common/AuthorCard";

const AuthorIdDynamicPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ authorId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const {authorId} = await params;
  const [authorCardDataState, user] = await Promise.all([
    getAuthorCardDataSF(authorId),
    getAuthenticatedUserASF()
  ]);

  return (
    <div className="flex flex-col">
      <AuthorCard
        state={authorCardDataState}
        readerId={user?.user_id ?? null}
        isSubscribeInfo={true}
        className="gap-[0.5rem] h-[10rem]"
      />
    </div>
  )
}
export default AuthorIdDynamicPage;
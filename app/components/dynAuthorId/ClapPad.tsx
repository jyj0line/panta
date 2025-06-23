import { getAuthenticatedUserASF, isAuthorASF, isLikingASF, isSubscribingASF } from "@/app/lib/SF/afterAuthSFs";
import { SubscribeButton } from "@/app/components/dynAuthorId/SubscribeButton";
import { LikeButton } from "@/app/components/dynAuthorId/LikeButton";

type ClapPadProps = {
    pageId: string
    authorId: string
    className?: string
}

export const ClapPad = async ({
    pageId,
    authorId,
    className
}: ClapPadProps) => {
    const [isAuthor, isLoggedIn, isLikingInit, isSubscribingInit] = await Promise.all([
        isAuthorASF(authorId),
        getAuthenticatedUserASF().then(reader => reader !== null),
        isSubscribingASF(authorId),
        isLikingASF(pageId)
    ]);

    if (isAuthor) return null;
    
    return (
        <div className={`flex flex-col ${className}`}>
            <LikeButton
                isLoggedIn={isLoggedIn}
                isLikingInit={isLikingInit}
                pageId={pageId}
                className="h-[50%]"
            />
            <SubscribeButton
                type="svg"
                isLoggedIn={isLoggedIn}
                isSubscribingInitial={isSubscribingInit}
                authorId={authorId}
                className="h-[50%]"
            />
        </div>
    )
}
"use client";

import { useSCtxedUserContext } from "@/app/lib/context/SCtxedUserContext";

type UserIdProps = {
    className: string
    skeletionClassName: string
}
export const UserId = ({
    className="leading-[1.2] text-[2.5rem] font-[500]",
    skeletionClassName="w-[10rem] h-[3rem]"
}: UserIdProps) => {
    const { user, isUserFirstLoading } = useSCtxedUserContext();
    
    if (isUserFirstLoading) return (
        <div className={`rounded-[0.5rem] bg-supersub animate-pulse ${skeletionClassName}`}></div>
    )

    return (
        <p className={className}>
            {user?.user_id}
        </p>
    )
}
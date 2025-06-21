"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { toggleLikeASF } from "@/app/lib/SF/afterAuthSFs";
import { LikeSvg } from "@/app/lib/svgs";

type LikeButtonProps = {
    isLikingInit: boolean
    pageId: string
    isLoggedIn: boolean
    className?: string
};

export const LikeButton = ({
    isLikingInit,
    pageId,
    isLoggedIn,
    className="h-[2rem]"
}: LikeButtonProps) => {
    const [isLiking, setIsLiking] = useState<boolean>(isLikingInit);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
  
    const handleLoginClick = () => {
        const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
        router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }

    const handleToggle = async () => {
        if (!isLoggedIn) {
            handleLoginClick();
            return;
        }

        setIsLiking(prev => !prev);
        try {
            const res = await toggleLikeASF(pageId);
            if (res === null) {
                handleLoginClick();
                return;
            }
            if (res === false) setIsLiking(prev => !prev);
        } catch(e) {
            console.error(e);
            setIsLiking(prev => !prev);
        }
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`
                flex justify-center items-center rounded-full p-[0.3rem] border-[0.1rem] 
                ${isLiking ? 'bg-background border-em' : 'bg-background border-supersub'}
                ${className}`}
        >
            <LikeSvg className={`w-auto h-full aspect-square ${isLiking ? 'fill-em' : "fill-supersub"}`} />
        </button>
    )
}
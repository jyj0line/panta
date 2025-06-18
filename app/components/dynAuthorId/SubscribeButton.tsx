"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { toggleSubscribeASF } from "@/app/lib/SFs/afterAuthSFs";
import { SubscribeSvg } from "@/app/lib/svgs";

type SubscribeButtonType = "text" | "svg";

type SubscribeButtonProps = {
    type: SubscribeButtonType
    isSubscribingInitial: boolean
    authorId: string
    isLoggedIn: boolean
    className?: string
};

export const SubscribeButton = ({
    type,
    isSubscribingInitial,
    authorId,
    isLoggedIn,
    className="h-[2rem]"
}: SubscribeButtonProps) => {
    const typeCn = type ==="text" ? "w-[7rem] p-[0.5rem]" : "p-[0.3rem]"
    const isSubscribingCn = type === "text"
    ? 'bg-background border-em border-supersub'
    : 'bg-background border-em';
    const notSubscribingCn = type === "text"
    ? 'text-background bg-em border-em'
    : 'bg-background border-supersub';

    const [isSubscribing, setIsSubscribing] = useState<boolean>(isSubscribingInitial);

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

        setIsSubscribing(prev => !prev);
        try {
            const res = await toggleSubscribeASF(authorId);
            if (res === null) {
                handleLoginClick();
                return;
            }
            if (res === false) setIsSubscribing(prev => !prev);
        } catch(_) {
            setIsSubscribing(prev => !prev);
        }
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`
                flex justify-center items-center rounded-full border-[0.1rem] ${typeCn}
                ${isSubscribing ? isSubscribingCn : notSubscribingCn}
                ${className}`}
        >
            {type === "text"
            ? (isSubscribing ? 'Subscribing' : 'Subscribe')
            : <SubscribeSvg
                className={`w-auto h-full aspect-square ${isSubscribing ? 'fill-em' : "fill-supersub"}`}
            />}
        </button>
    )
}
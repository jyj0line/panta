"use client";

import { useState } from "react";

import { subscribeToggleASF } from "@/app/lib/SFs/afterAuthSFs";
import { redirectLoginSF } from "@/app/lib/SFs/publicSFs";
import { type User } from "@/app/lib/tables";

type SubscribeButtonProps = {
    isSubscribingInitial: boolean
    authorId: User["user_id"]
    readerId: User["user_id"] | null
    className?: string
};

export const SubscribeButton = ({
    isSubscribingInitial,
    authorId,
    readerId,
    className="h-[2rem]"
}: SubscribeButtonProps) => {
    const [isSubscribing, setIsSubscribing] = useState<boolean>(isSubscribingInitial);

    const handleToggle = async () => {
        if (!readerId) {
            redirectLoginSF();
            return;
        }

        setIsSubscribing(prev => !prev);
        try {
            const res = await subscribeToggleASF(authorId);
            if (!res) setIsSubscribing(prev => !prev);
        } catch(_) {
            setIsSubscribing(prev => !prev);
        }
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`
                flex justify-center items-center w-[7.5rem] p-[0.5rem] rounded-full
                ${isSubscribing ?
                    'border-[0.1rem] border-em':
                    'text-background bg-em'}
                ${className}`}>
            {isSubscribing ? 'Subscribing' : 'Subscribe'}
        </button>
    )
}
"use client";

import { subscribeToggleSF } from "@/app/lib/SFs/afterAuthSFs";
import { useState } from "react";

import { type User } from "@/app/lib/tables";

type SubscribeButtonProps = {
    isSubscribingInitial: boolean
    authorId: User["user_id"]
    readerId: User["user_id"]
    className?: string
}
export const SubscribeButton = ({
    isSubscribingInitial,
    authorId,
    readerId,
    className="h-[2rem]"
}: SubscribeButtonProps) => {
    const [isSubscribing, setIsSubscribing] = useState<boolean>(isSubscribingInitial);

    const handleToggle = async () => {
        setIsSubscribing((prev) => !prev);
        await subscribeToggleSF({userId: readerId, authorId: authorId});
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
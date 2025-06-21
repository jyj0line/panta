"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type NotLoggedInProps = {
    heading: string
    paragraph: string
    className?: string
}

export const NotLoggedIn = ({
    heading,
    paragraph,
    className
}: NotLoggedInProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
  
    const handleLoginClick = () => {
        const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
        router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }

    const handleSignupClick = () => {
        const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
        router.push(`/signup?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }

    return (
        <div className={`flex flex-col ${className}`}>
            <h3 className="text-[2rem] font-[500]">{heading}</h3>

            <p>{paragraph}</p>

            <div className="flex flex-row gap-[1rem]">
                <button
                    type="button"
                    onClick={handleSignupClick}
                    className='flex justify-center items-center px-[1rem] py-[0.5rem] rounded-[0.5rem] bg-sub text-background'
                >
                    Sign Up
                </button>

                <button
                    type="button"
                    onClick={handleLoginClick}
                    className='flex justify-center items-center px-[1rem] py-[0.5rem] rounded-[0.5rem] bg-supersub'
                >
                    Login
                </button>
            </div>
        </div>
    )
}
import Image from "next/image";
import Link from "next/link";

import {
    type GetAutPageTurnerParam, type GetBooPageTurnerParam,
    getAutPageTurnerSF, getBooPageTurnerSF
} from "@/app/lib/SF/publicSFs";
import { LeftSvg, RightSvg } from "@/app/lib/svgs";
import { DEFAULT } from "@/app/lib/constants";

type AutPageTurnerProps = {
    curPageId: GetAutPageTurnerParam
    className?: string
}

export const AutPageTurner = async ({
    curPageId,
    className="h-[4rem]"
}: AutPageTurnerProps) => {
    const data = await getAutPageTurnerSF(curPageId);

    if (!data) return null;

    const { authorId, authorProfileImageUrl, prev, next } = data;

    return (
        <div className={`flex flex-row justify-center items-center ${className}`}>
            {prev ?
            <Link
                href={`/@${authorId}/${prev.pageId}`}
                className="flex-1 flex flex-row justify-start items-center h-full"
            >
                <LeftSvg className="w-auto h-full aspect-auto" />
                <span className="truncate">{prev.title}</span>
            </Link>
            : <div className="flex-1"></div>}
            
            <Link
                href={`/@${authorId}`}
                className="relative w-auto h-full aspect-square"
            >
                <Image
                    src={authorProfileImageUrl ?? DEFAULT.DEFAULT_PROFILE_IMAGE_URL}
                    alt='author profile image'
                    fill
                    sizes="33vw"
                    className="object-cover rounded-full bg-supersub"
                />
            </Link>

            {next ?
            <Link
                href={`/@${authorId}/${next.pageId}`}
                className="flex-1 flex flex-row justify-end items-center h-full"
            >
                <span className="truncate">{next.title}</span>
                <RightSvg className="w-auto h-full aspect-auto" />
            </Link>
            : <div className="flex-1"></div>}
        </div>
    )
}

type BooPageTurnerProps = {
    curPageId: GetBooPageTurnerParam
    className?: string
}

export const BooPageTurner = async ({
    curPageId,
    className="h-[4rem]"
}: BooPageTurnerProps) => {
    const data = await getBooPageTurnerSF(curPageId);

    if (!data) return null;

    const { authorId, bookId, prev, next } = data;

    return (
        <div className={`flex flex-row justify-center items-center ${className}`}>
            {prev ?
            <Link
                href={`/@${authorId}/${prev.pageId}`}
                className="flex-1 flex flex-row justify-start items-center h-full"
            >
                <LeftSvg className="w-auto h-full aspect-auto" />
                <span className="truncate">{prev.title}</span>
            </Link>
            : <div className="flex-1"></div>}
            
            <Link
                href={`/@${authorId}/books/${bookId}`}
                className="relative w-auto h-full aspect-square"
            >
                <Image
                    src={DEFAULT.DEFAULT_BOOK_IMAGE_URL}
                    alt='book profile image'
                    fill
                    sizes="33vw"
                    className="object-cover rounded-full bg-supersub"
                />
            </Link>

            {next ?
            <Link
                href={`/@${authorId}/${next.pageId}`}
                className="flex-1 flex flex-row justify-end items-center h-full"
            >
                <span className="truncate">{next.title}</span>
                <RightSvg className="w-auto h-full aspect-auto" />
            </Link>
            : <div className="flex-1"></div>}
        </div>
    )
}
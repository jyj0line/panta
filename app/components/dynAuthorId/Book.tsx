import Link from "next/link";

type BookProps = {
    authorId: string
    book_id: string
    book_title: string
    pages_count: number
    className?: string
};

export const Book = ({
    authorId,
    book_id,
    book_title,
    pages_count,
    className
}: BookProps) => {
    return (
        <Link href={`/@${authorId}/books/${book_id}`} className={`flex flex-col border-[0.1rem] border-l-[1rem] border-supersub ${className}`}>
            <div className="flex-1">
                <p className="text-[1.2rem] font-[500] break-words line-clamp-3">{book_title}</p>
            </div>
            <p className="self-end text-[0.9rem] text-[300] text-sub">{pages_count} pages</p>
        </Link>
    )
}
import { PageSvg, BookSvg } from "@/app/lib/svgs"

export type WriteMode = "page" | "books";
type WriteModeSelectorProps = {
    currentMode : WriteMode
    onClickPage: () => void
    onClickBooks: () => void
    className?: string
}

export const WriteModeSelector = ({
    currentMode,
    onClickPage,
    onClickBooks,
    className="h-[2rem]"
}: WriteModeSelectorProps) => {
    return (
        <div className={`flex flex-row items-center ${className}`}>
            <button
                type="button"
                onClick={onClickPage}
                className={`
                    flex justify-center items-center
                    w-auto h-full aspect-square
                    ${currentMode === "page" ? 'bg-sub rounded-t-[0.5rem]': ''}
                `}
            >
                <PageSvg className={`w-auto h-[80%] aspect-auto ${currentMode === "page" ? 'fill-wh' : ''}`} />
            </button>

            <button
                type="button"
                onClick={onClickBooks}
                className={`
                    flex justify-center items-center
                    w-auto h-full aspect-square
                    ${currentMode === "books" ? 'bg-sub rounded-t-[0.5rem]': ''}
                `}
            >
                <BookSvg className={`w-auto h-[80%] aspect-auto ${currentMode === "books" ? 'fill-wh' : ''}`} />
            </button>
        </div>
    )
}
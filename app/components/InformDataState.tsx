import { EmptySvg, EndSvg, ErrorSvg } from '@/app/lib/svgs'

export const Empty = () => {
  return(
    <div className="flex flex-col items-center mt-12">
        <EmptySvg className="w-20 h-20"/>
        <h3 className="p-2 text-3xl font-semibold">No Pages</h3>
        <p className="p-2 text-lg text-sub">There are no pages.</p>
    </div>
  );
}

export const End = () => {
  return(
    <div className="flex flex-col justify-center items-center mt-12 border-t-[0.05rem] border-sub">
        <EndSvg className="w-20 h-20 mt-12"/>
        <h3 className="p-2 text-3xl font-semibold">All pages loaded.</h3>
        <p className="p-2 text-lg text-sub">There are no pages to load more.</p>
    </div>
  )
}

type ErrorProps = {
  showTopBorder: boolean;
};
export const Error = ({ showTopBorder }: ErrorProps) => {
  return(
    <div className={`flex flex-col items-center mt-12 ${showTopBorder && 'border-t-[0.05rem] border-sub'}`}>
        <ErrorSvg className="w-20 h-20 mt-12"/>
        <h3 className="p-2 text-3xl font-semibold">Error</h3>
        <p className="p-2 text-lg text-sub">Something went wrong.</p>
    </div>
  )
}
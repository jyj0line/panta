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
    <div className="flex flex-col justify-center items-center border-t-[0.05rem] border-supersub mt-[2rem]">
        <EndSvg className="w-20 h-20 mt-12"/>
        <h3 className="p-2 text-3xl font-semibold">All pages loaded.</h3>
        <p className="p-2 text-lg text-sub">There are no pages to load more.</p>
    </div>
  )
}

export const Error = () => {
  return(
    <div className={'flex flex-col items-center mt-12'}>
        <ErrorSvg className="w-20 h-20 mt-12"/>
        <h3 className="p-2 text-3xl font-semibold">Error</h3>
        <p className="p-2 text-lg text-sub">Something went wrong.</p>
    </div>
  )
}
"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { InfiniteScrollSvg, PaginationSvg } from '@/app/lib/svgs';

import { SEARCH_PARAMS } from "@/app/lib/constants";

type SlipsModeSelectorProps = {
  currentValue: number | null
  className?: string
};

export const SlipsModeSelector = ({ currentValue, className="h-[2rem]" }: SlipsModeSelectorProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const handleInf = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(SEARCH_PARAMS.P_PARAM);
    push(`${pathname}?${params.toString()}`);
  };

  const handlePag = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(SEARCH_PARAMS.P_PARAM, SEARCH_PARAMS.P_INIT_VALUE);
    push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={`flex flex-row ${className}`}>
      <button type="button" onClick={handleInf} className="h-full">
        <InfiniteScrollSvg className={`w-auto h-[60%] aspect-auto ${currentValue ? 'fill-supersub' : 'fill-sub'}`} />
      </button>

      <button type="button" onClick={handlePag} className="h-full">
        <PaginationSvg className={`w-auto h-[100%] aspect-auto ${currentValue ? 'fill-sub' : 'fill-supersub'}`} />
      </button>
    </div>
  );
}

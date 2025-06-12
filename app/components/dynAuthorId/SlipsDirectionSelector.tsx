"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { DescSvg, AscSvg} from '@/app/lib/svgs';

import { SEARCH_PARAMS } from "@/app/lib/constants";

type SlipsDirectionSelectorProps = {
  currentValue: "desc" | "asc"
  className?: string
};

export const SlipsDirectionSelector = ({ currentValue, className="h-[2rem]" }: SlipsDirectionSelectorProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const handleDesc = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(SEARCH_PARAMS.OD_PARAM);
    push(`${pathname}?${params.toString()}`);
  };

  const handleAsc = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(SEARCH_PARAMS.OD_PARAM, SEARCH_PARAMS.OD_ASC_VALUE);
    push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={`flex flex-row ${className}`}>
      <button type="button" onClick={handleDesc} className="h-full">
        <DescSvg className={`w-auto h-[100%] aspect-auto ${currentValue === "desc" ? 'stroke-sub' : 'stroke-supersub'}`} />
      </button>

      <button type="button" onClick={handleAsc} className="h-full">
        <AscSvg className={`w-auto h-[100%] aspect-auto ${currentValue === "asc" ? 'stroke-sub' : 'stroke-supersub'}`} />
      </button>
    </div>
  );
}

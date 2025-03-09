"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { InfiniteScrollSvg, PaginationSvg } from '@/app/lib/svgs';

type SearchResultsModeProps = {
  mode: "set" | "delete";
  param: string;
  value: string;
  isDisabled: boolean;
};
export const SearchResultsMode = ({ mode, param, value, isDisabled }: SearchResultsModeProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (mode === "set") {
      params.set(param, value);
    } else {
      params.delete(param);
    }

    push(`${pathname}?${params.toString()}`);
  };

  return <button disabled={isDisabled} onClick={handleClick}>
    {mode === 'set'
    ? <PaginationSvg className={`w-[4rem] h-[4rem] p-[0.25rem] ${isDisabled && 'fill-em'}`} />
    : <InfiniteScrollSvg className={`w-[2.5rem] h-[2.5rem] p-[0.25rem] ${isDisabled && 'fill-em'}`} />}
  </button>;
}

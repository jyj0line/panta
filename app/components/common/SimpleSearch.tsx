'use client';

import { useState } from "react";
import { usePathname, useRouter } from 'next/navigation';

import { useDebounce } from '@/app/lib/hooks';
import { TextInput } from '@/app/components/leaves/TextInput';

import { SEARCH_PARAMS, PLACEHOLDER } from "@/app/lib/constants";
const DELAY = 500;

type SimpleSearchProps = {
  p: number | null
  initialSearch: string
  className?: string
};

export const SimpleSearch = ({ p, initialSearch, className="search" }: SimpleSearchProps) => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const [search, setSearch] = useState<string>(initialSearch);

  const handleSimpleSearch = (term: string) => {
    const params = new URLSearchParams();
    if (term) {
      params.set(SEARCH_PARAMS.SEARCH_PARAM, term);
      if (p) {
        params.set(SEARCH_PARAMS.P_PARAM, SEARCH_PARAMS.P_INIT_VALUE);
      }
    }

    replace(`${pathname}?${params.toString()}`);
  }
  const debouncedHandleSimpleSearch = useDebounce(handleSimpleSearch, DELAY);
  const finalHandleSimpleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedHandleSimpleSearch(e.target.value);
  };

  return(
    <TextInput
      value={search}
      onChange={finalHandleSimpleSearch}
      placeholder={PLACEHOLDER.SEARCH_PLACEHOLDER}
      className={`search ${className}`}
    />
  )
}
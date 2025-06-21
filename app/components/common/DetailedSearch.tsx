'use client';

import { useState } from "react";
import { usePathname, useRouter } from 'next/navigation';

import { areSameArraies } from '@/app/lib/utils';
import { TextInput } from '@/app/components/atomic/TextInput';
import { type GivenToken, TokenInput } from '@/app/components/common/TokenInput';
import { DateInput } from '@/app/components/atomic/DateInput';

import { SEARCH_PARAMS, PLACEHOLDER } from "@/app/lib/constants";
const SAME_SEARCH_ALERT = "same search requirements.";
const NO_SEARCH_KEYS_ALERT = "input search requirements.";

type DetailedSearchProps = {
  p: number | null
  initialSearch: string
  initialTagIds: string[]
  initialUserIds: string[]
  initialCreatedAtFrom: string | null
  initialCreatedAtTo: string | null
  showUserIdSearch: boolean
  givenTokens?: GivenToken[]
  className?: string
}

export const DetailedSearch = ({
  p,
  initialSearch,
  initialTagIds,
  initialUserIds,
  initialCreatedAtFrom,
  initialCreatedAtTo,
  showUserIdSearch,
  givenTokens,
  className
}: DetailedSearchProps) => {
  const pathname = usePathname();
  const { push } = useRouter();

  const [search, setSearch] = useState<string>(initialSearch);
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [userIds, setUserIds] = useState<string[]>(initialUserIds);
  const [createdAtFrom, setCreatedAtFrom] = useState<string | null>(initialCreatedAtFrom);
  const [createdAtTo, setCreatedAtTo] = useState<string | null>(initialCreatedAtTo);

  const isNonInitialSearch =
    !initialSearch
    && initialTagIds.length === 0
    && (!showUserIdSearch || initialUserIds.length === 0)
    && !initialCreatedAtFrom
    && !initialCreatedAtTo
  ;

  const sameSearch = search === initialSearch;
  const sameTagIds = areSameArraies(tagIds, initialTagIds);
  const sameUserIds = !showUserIdSearch || areSameArraies(userIds, initialUserIds); 
  const sameFrom = createdAtFrom === initialCreatedAtFrom;
  const sameTo = createdAtTo === initialCreatedAtTo;
  const isSameSearch = sameSearch && sameTagIds && sameUserIds && sameFrom && sameTo;

  const handleDetailedSearch = () => {
    if (isSameSearch) {
      alert(SAME_SEARCH_ALERT);
      return;
    }

    const params = new URLSearchParams();
    if (search) params.set(SEARCH_PARAMS.SEARCH_PARAM, search);
    if (tagIds.length > 0) {
      tagIds.forEach(tag => params.append(SEARCH_PARAMS.TAG_PARAM, tag));
    }
    if (showUserIdSearch && userIds.length > 0) {
      userIds.forEach(user => params.append(SEARCH_PARAMS.USER_PARAM, user));
    }
    if (createdAtFrom) params.set(SEARCH_PARAMS.CREATED_AT_FROM_PARAM, createdAtFrom);
    if (createdAtTo) params.set(SEARCH_PARAMS.CREATED_AT_TO_PARAM, createdAtTo);

    if ([...params.keys()].length === 0) {
      alert(NO_SEARCH_KEYS_ALERT);
      return;
    }

    if (p) params.set(SEARCH_PARAMS.P_PARAM, SEARCH_PARAMS.P_INIT_VALUE);

    push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* inputs start */}
      <TextInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={PLACEHOLDER.SEARCH_PLACEHOLDER}
        className='search'
      />

      <TokenInput
        tokens={tagIds}
        setTokens={setTagIds}
        givenTokens={givenTokens}
        placeholder={PLACEHOLDER.TAG_IDS_PLACEHOLDER}
        className="gap-[0.5rem]"
        tokensClassName='gap-[0.5rem]'
        tokenClassName='token border-em'
        inputClassName='search flex-1'
      />

      {showUserIdSearch
      && <TokenInput
        tokens={userIds}
        setTokens={setUserIds}
        placeholder={PLACEHOLDER.USER_IDS_PLACEHOLDER}
        className="gap-[0.5rem]"
        tokensClassName='gap-[0.5rem]'
        tokenClassName='token border-sub'
        inputClassName='search'
      />}

      <div className="flex flex-row items-center gap-[1rem]">
        <DateInput
          id="created_at_from"
          date={createdAtFrom}
          onChange={(e) => setCreatedAtFrom(e.target.value)}
          className="search"
        />
        <span className="text-[2rem] font-[500] text-sub">
          ~
        </span>
        <DateInput
          id="created_at_to"
          date={createdAtTo}
          onChange={(e) => setCreatedAtTo(e.target.value)}
          className="search"
        />
      </div>
      {/* inputs end */}

      {/* search section start */}
      <div className="flex flex-row justify-between items-center py-[0.2rem]">
        <div>
          {!isNonInitialSearch && (isSameSearch ? "searched" : "not searched")}
        </div>

        <button
          type="button"
          onClick={() => handleDetailedSearch()}
          className="bg-em text-background px-[1rem] py-[0.5rem] rounded-[0.5rem]"
        >
          search
        </button>
      </div>
      {/* search section end */}
    </div>
  );
};
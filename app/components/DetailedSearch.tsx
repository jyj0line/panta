'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { SearchCriticSelector } from '@/app/components/SearchCriticSelector';
import { TokenInput } from '@/app/components/leaves/TokenInput';
import { areSameArraies, isSameDate } from '@/app/lib/utils';
import type { SearchedParamsType } from "@/app/lib/sqls"
import { DetailedSearchSvg, ArrowDropupSvg } from '@/app/lib/svgs'

type DetailedSearchProps = {
  onToggle: () => void,
  p: number | undefined,
  searchedParams: SearchedParamsType
}
export const DetailedSearch = ({onToggle, p, searchedParams}: DetailedSearchProps) => {
  const pathname = usePathname();
  const { push } = useRouter();

  const [users, setUsers] = useState<string[]>(searchedParams?.user_ids || []);
  const [tags, setTags] = useState<string[]>(searchedParams?.tag_ids || []);
  const [search, setSearch] = useState<string>(searchedParams?.search || '');
  const [createdAtFrom, setCreatedAtFrom] = useState<string>(
    searchedParams?.created_at_from?.toISOString().split("T")[0] || ''
  );
  const [createdAtTo, setCreatedAtTo] = useState<string>(
    searchedParams?.created_at_to?.toISOString().split("T")[0] || ''
  );


  const sameUserIds = areSameArraies(users, searchedParams?.user_ids || []);
  const sameSearch = (search || '') === (searchedParams?.search || '');
  const sameTagIds = areSameArraies(tags, searchedParams?.tag_ids || []);
  const sameFrom = isSameDate(createdAtFrom, searchedParams?.created_at_from)
  const sameTo = isSameDate(createdAtTo, searchedParams?.created_at_to)
  const isSearched = sameUserIds && sameSearch && sameTagIds && sameFrom && sameTo;

  const handleDetailedSearch = () => {
    if (isSearched) {
      alert("same search requirements.");
      return;
    }

    const params = new URLSearchParams();

    if (users.length > 0) {
      params.delete("user");
      users.forEach(user => params.append("user", user));
    } else {
      params.delete("user");
    }

    if (search) params.set("search", search);
    else params.delete("search");

    if (tags.length > 0) {
      params.delete("tag");
      tags.forEach(tag => params.append("tag", tag));
    } else {
      params.delete("tag");
    }

    if (createdAtFrom) params.set("created_at_from", createdAtFrom);
    else params.delete("created_at_from");

    if (createdAtTo) params.set("created_at_to", createdAtTo);
    else params.delete("created_at_to");

    if (p) params.set('p', '1');

    if ([...params.keys()].length === 0) {
      alert("input search requirements.");
      return;
    }

    push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-[0.5rem] w-[80%]">
      <span className="self-end p-[0.5rem] text-[1rem]">{isSearched ? "searched" : "not searched..."}</span>
      <TokenInput tokens={users} setTokens={setUsers} type="user" forSearch={true} />
      <input
        id='search'
        type="search"
        placeholder='title or content'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />
      <TokenInput tokens={tags} setTokens={setTags} type="tag" forSearch={true} />
      <div className="flex flex-row justify-center items-center gap-[1rem]">
        <input id="created_at_from" type="date" className="search flex-1"
          value={createdAtFrom}
          onChange={(e) => setCreatedAtFrom(e.target.value)}
        />
        <span className="leading-[3rem] text-[2rem] font-[500] text-foreground">~</span>
        <input id="created_at_to" type="date" className="search flex-1"
          value={createdAtTo}
          onChange={(e) => setCreatedAtTo(e.target.value)}
        />
      </div>
      <div className='self-end flex flex-row items-center gap-[1.5rem]'>
        <SearchCriticSelector currentOrderCritic={searchedParams.orderCritic}/>
        <div onClick={onToggle} className='flex flex-row items-center cursor-pointer'>
          <DetailedSearchSvg className="w-[2rem] h-[2rem]"/>
          <ArrowDropupSvg className="w-[1.5rem] h-[1.5rem]"/>
        </div>
        <button onClick={() => handleDetailedSearch()}
          className="w-[5rem] h-[2.5rem] rounded-[0.5rem] text-[1rem] text-background bg-em"
        >
          search
        </button>
      </div>
    </div>
  );
};


'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { SearchCriticSelector } from '@/app/components/SearchCriticSelector';
import type { SearchedParamsType } from "@/app/lib/sqls"
import { DetailedSearchSvg, ArrowDropUpSvg } from '@/app/lib/svgs'

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


  const sameUserIds = areEqualArraies(users, searchedParams?.user_ids || []);
  const sameSearch = (search || '') === (searchedParams?.search || '');
  const sameTagIds = areEqualArraies(tags, searchedParams?.tag_ids || []);
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
      <TokenInput tokens={users} setTokens={setUsers} type="user"/>
      <input
        id='search'
        type="search"
        placeholder='title or content'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />
      <TokenInput tokens={tags} setTokens={setTags} type="tag"/>
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
          <ArrowDropUpSvg className="w-[1.5rem] h-[1.5rem]"/>
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

type TokenInputProps = {
  tokens: string[];
  setTokens: React.Dispatch<React.SetStateAction<string[]>>;
  type: "user" | "tag"
}
const TokenInput = ({ tokens, setTokens, type }: TokenInputProps) => {
  const typeClassName = type === 'tag'? 'border-em' : 'border-sub';

  const [value, setValue] = useState("");
  const addToken = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !tokens.includes(trimmedValue)) {
      setTokens([...tokens, trimmedValue]);
    }
    setValue("");
  };

  const removeToken = (token: string) => {
    setTokens(tokens.filter((t) => t !== token));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      addToken();
    }
  };

  return (
    <div className='flex flex-col gap-[0.5rem] w-full'>
      {!!tokens.length &&
      <div className="flex flex-row flex-wrap gap-[0.5rem] w-full">
        {tokens.map((token) => (
        <span
          key={token}
          className={`p-[0.5rem] rounded-[0.5rem] border-[0.1rem] ${typeClassName} cursor-pointer`}
          onClick={() => removeToken(token)}
        >
          {token} ✕
        </span>
        ))}
      </div>}
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={type}
        className="search"
      />
    </div>
  );
};

const areEqualArraies = (array1: any[], array2: any[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }
  return array1.every((value, index) => value === array2[index]);
}

const isSameDate = (value: string, date: Date | undefined): boolean => {
  if (!value && !date) return true;

  if (!value || !date) return false;

  const [year, month, day] = value.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
};


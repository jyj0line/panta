'use client';

import { useState } from 'react';

import { useToggleVisibility } from '@/app/lib/hooks';
import { TextInput } from '@/app/components/leaves/TextInput';
import { TagSvg } from '@/app/lib/svgs';

export type GivenToken = {
  token: string
  count: number
};

type TokenInputProps = {
    name?: string
    tokens: string[]
    setTokens: React.Dispatch<React.SetStateAction<string[]>>
    givenTokens?:  GivenToken[]
    placeholder?: string
    className?: string;
    tokensClassName?: string;
    tokenClassName?: string;
    inputClassName?: string;
};

export const TokenInput = ({
  name,
  tokens,
  setTokens,
  givenTokens,
  placeholder,
  className,
  tokensClassName,
  tokenClassName,
  inputClassName
}: TokenInputProps) => {
    const [token, setToken] = useState<string>("");

    const { isVisible, setIsVisible, ref } = useToggleVisibility();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setToken(e.target.value);
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === " " || e.key === "Enter") {
        addToken();
      }
    };

    const addToken = (newToken?: string) => {
      const trimmedNewToken = (newToken ?? token).trim();

      if (trimmedNewToken && !tokens.includes(trimmedNewToken)) {
        setTokens([...tokens, trimmedNewToken]);
      }

      if (!newToken) setToken("");
    };
  
    const removeToken = (token: string) => {
      setTokens(tokens.filter((t) => t !== token));
    };
    
    const toggleToken = (tokenToToggle: string) => {
      if (tokens.includes(tokenToToggle)) {
        removeToken(tokenToToggle);
      } else {
        addToken(tokenToToggle);
      }
    };

    return (
      <div ref={ref} className={`flex flex-col ${className}`}>
        <input type="hidden" name={name} value={JSON.stringify(tokens)} />

        {tokens.length > 0 &&
        <div className={`flex flex-row flex-wrap ${tokensClassName}`}>
          {tokens.map((token) => (
          <button
            key={token}
            type="button"
            className={tokenClassName}
            onClick={() => removeToken(token)}
          >
            {token} ✕
          </button>
          ))}
        </div>}
        
        <div className='flex flex-row items-center'>
          <TextInput
            type="search"
            value={token}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClassName}
          />

          {givenTokens &&
          <div className='relative w-[3rem] h-[3rem] p-[0.5rem]'>
            <button type="button" onClick={() => setIsVisible((prev)=>!prev)} className='h-full'>
              <TagSvg className="w-auto h-full aspect-auto" />
            </button>

            {isVisible
            && <div
              className={`
                absolute top-[115%] right-[0px] flex flex-row flex-wrap items-start
                bg-wh w-[20rem] h-[12rem] p-[1rem] rounded-[0.5rem] border-[0.1rem] border-supersub
                z-[10] overflow-y-auto hide_scrollbar ${tokensClassName}`}>
              {givenTokens.map(({token, count}) => {
              const isAdded = tokens.includes(token);
              return (
              <button
                key={token}
                type="button"
                onClick={() => toggleToken(token)}
                className={`border-em ${tokenClassName} ${isAdded ? "opacity-[.25]" : "opacity-[1]"}`}
              >
                <span>{token}</span> <span className='text-[0.9rem] font-[300] text-sub'>{`(${count})`}</span>
              </button>
              );})}
            </div>}
          </div>}
        </div>
      </div>
    );
};
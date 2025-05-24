'use client';

import { useState } from 'react';

type TokenInputProps = {
    name: string
    tokens: string[];
    setTokens: React.Dispatch<React.SetStateAction<string[]>>;
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
  placeholder,
  className,
  tokensClassName,
  tokenClassName,
  inputClassName
}: TokenInputProps) => {
    const [value, setValue] = useState<string>("");

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
      if (e.key === " " || e.key === "Enter") {
        addToken();
      }
    };
  
    return (
      <div className={`flex flex-col ${className}`}>
        <input type="hidden" name={name} value={JSON.stringify(tokens)} />

        {tokens.length > 0 &&
        <div className={`flex flex-row flex-wrap ${tokensClassName}`}>
          {tokens.map((token) => (
          <span
            key={token}
            className={`rounded-[0.5rem] cursor-pointer ${tokenClassName}`}
            onClick={() => removeToken(token)}
          >
            {token} ✕
          </span>
          ))}
        </div>}

        <input
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={inputClassName}
        />
      </div>
    );
};
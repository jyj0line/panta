'use client'
import {useState} from 'react';

type TokenInputProps = {
    tokens: string[];
    setTokens: React.Dispatch<React.SetStateAction<string[]>>;
    type: "user" | "tag";
    forSearch: boolean;
}
export const TokenInput = ({ tokens, setTokens, type, forSearch }: TokenInputProps) => {
    const typeClassName = type === 'tag'? 'border-em' : 'border-sub';
    const forSeachClassName = forSearch ? 'search' : 'textarea';
    const forSearchClassNameBg = forSearch ? '' : 'bg-wh';
    const forSearchClassNameGap = forSearch ? 'gap-[0.5rem]' : '';

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
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        addToken();
      }
    };
  
    return (
      <div className={`flex flex-col ${forSearchClassNameGap} w-full`}>
        {!!tokens.length &&
        <div className={`flex flex-row flex-wrap gap-[0.5rem] w-full ${forSearchClassNameBg}`}>
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
          placeholder={type}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={forSeachClassName}
        />
      </div>
    );
};
import React from 'react';

type TextInputProps = {
    name?: string;
    type?: "text" | "search"
    value: string;
    placeholder?: string;
    maxLength?: number;
    readOnly?: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    className?: string;
}
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
    ({ type="text", name, value, placeholder, maxLength, readOnly, onChange, onBlur, onKeyDown, className }, ref) => {
    return (
        <input
          type={type}
          ref={ref}
          name={name}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
          aria-readonly={readOnly}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={className}
        />
    )
});
TextInput.displayName = 'TextInput';
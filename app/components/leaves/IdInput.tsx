import React from 'react';

type IdInputProps = {
    name: string;
    value: string;
    placeholder: string;
    maxLength?: number;
    readOnly: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
}
export const IdInput = React.forwardRef<HTMLInputElement, IdInputProps>(
    ({ name, value, placeholder, maxLength, readOnly, onChange, onBlur, className }, ref) => {
    return (
        <input
          type="text"
          ref={ref}
          name={name}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
          aria-readonly={readOnly}
          onChange={onChange}
          onBlur={onBlur}
          className={className}
        />
    )
});
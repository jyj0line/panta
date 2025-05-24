type PasswordInputProps = {
    name: string;
    showPassword: boolean;
    value: string;
    placeholder: string;
    maxLength?: number;
    readOnly: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
}
export const PasswordInput = ({name, showPassword, value, placeholder, maxLength, readOnly, onChange, onBlur, className } : PasswordInputProps) => {
    return (
        <input
            name={name}
            type={showPassword ? 'text' : 'password'}
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
}
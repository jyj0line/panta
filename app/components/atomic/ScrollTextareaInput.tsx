type ScrollTextareaInputProps = {
  name: string;
  readOnly: boolean;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
};
export const ScrollTextareaInput = ({
  name,
  readOnly,
  value,
  placeholder,
  maxLength,
  onChange,
  onBlur,
  className,
}: ScrollTextareaInputProps) => {
  return (
    <textarea
      name={name}
      aria-describedby={`${name}-message`}
      readOnly={readOnly}
      aria-readonly={readOnly}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={1}
      onChange={onChange}
      onBlur={onBlur}
      className={className}
    />
  );
}
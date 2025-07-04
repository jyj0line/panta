const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const target = e.currentTarget;

  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
};

type TextareaInputProps = {
  name?: string;
  readOnly?: boolean;
  value: string;
  placeholder?: string;
  maxLength: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
};

export const TextareaInput = ({
  name,
  readOnly,
  value,
  placeholder,
  maxLength,
  onChange,
  className = "",
}: TextareaInputProps) => {
  const combinedOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    autoResize(e);
  };

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
      onChange={combinedOnChange}
      className={`textarea ${className}`}
    />
  );
}
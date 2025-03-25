type InputErrorProps = {
  name: string;
  errors?: string[];
};
export const InputError = ({ name, errors }: InputErrorProps) => {
  return (
    <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
      {errors &&
      errors.map((error) => (
      <p key={error} className="text-[1rem] p-[0.5rem] text-bad">
        {error}
      </p>
      ))}
    </div>
  );
};
type InputMessageProps = {
  name?: string;
  messages?: string | string[];
  prefix?: string;
  className?: string;
};
export const PrefixedMessage = ({ name, messages, prefix, className }: InputMessageProps) => {
  const messageArray = typeof messages === "string" ? [messages] : messages;

  return (
    <div id={`${name ? `${name}-message` : undefined}`} aria-atomic="true" aria-live="polite" className={`flex flex-col ${className}`}>
      {messageArray &&
      messageArray.map((message) => (
        <p key={message}>
          {prefix}{message}
        </p>
      ))}
    </div>
  );
};
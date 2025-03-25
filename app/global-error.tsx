'use client';
import { useEffect } from 'react';

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex justify-center items-center min-h-dvh">
        <h2 className="p-[1rem]">
          Something went wrong!
        </h2>
        <button
          onClick={() => reset()}
          className="px-[1.5rem] py-[1rem] rounded-[0.5rem] text-background bg-em"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
export default GlobalError;
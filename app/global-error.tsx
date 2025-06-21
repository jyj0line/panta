'use client';

import { useEffect } from 'react';

import "@/app/globals.css";
import { inter } from '@/app/lib/fonts';
import { Error } from "@/app/components/atomic/Error";

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
    <html lang="en">
      <body className={`min-h-dvh text-[16px] ${inter.className} antialiased bg-background text-foreground`}>
        <Error reset={reset} />
      </body>
    </html>
  )
}
export default GlobalError;
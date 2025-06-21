import type { Metadata } from 'next';

import {ToastBundleProvider} from "@/app/lib/context/ToastBundleContext";
import { inter } from '@/app/lib/fonts';
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Panta',
  },
  description: 'Page and Tag.',
  //metadataBase: new URL('https://'),
  applicationName: 'Panta',
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`min-h-dvh text-[16px] ${inter.className} antialiased bg-background text-foreground`}>
        <ToastBundleProvider>
          {children}
        </ToastBundleProvider>
      </body>
    </html>
  );
}

export default Layout;

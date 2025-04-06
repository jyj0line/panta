import type { Metadata } from 'next';

import "@/app/globals.css";
import { inter } from '@/app/lib/fonts';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Panta',
  },
  description: 'Page and Tag.',
  //metadataBase: new URL('https://panta.com'),
  applicationName: 'Panta',
};

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={`text-[16px] ${inter.className} antialiased bg-background text-foreground`}>
      <body className={`min-h-dvh`}>
        {children}
      </body>
    </html>
  );
}

export default Layout;

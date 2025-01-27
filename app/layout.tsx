import "@/app/globals.css";
import { inter } from '@/app/lib/fonts';

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={`text-[16px] ${inter.className} antialiased`}>
      <body className={`min-h-dvh`}>
        {children}
      </body>
    </html>
  );
}

export default Layout;

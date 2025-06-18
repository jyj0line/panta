import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Login'
  }
};

const LoginLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
    return [children];
};
export default LoginLayout;
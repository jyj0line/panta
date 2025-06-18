import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Sign Up'
  }
};

const SignupLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
    return [children];
};
export default SignupLayout;
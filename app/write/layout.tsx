import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Write'
  }
};

const WriteLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
    return [children]
};
export default WriteLayout;
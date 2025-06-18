import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Like'
  }
};

const LikeLayout = async ({
  children
}: { children: React.ReactNode }) => {
  return(
    [children]
  );
}
export default LikeLayout;
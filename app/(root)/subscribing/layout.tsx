import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Subscribing'
  }
};

const SubscribingLayout = async ({
  children
}: { children: React.ReactNode }) => {
  return(
    [children]
  );
}
export default SubscribingLayout;
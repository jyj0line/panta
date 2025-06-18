import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Setting: Account'
  }
};

const AccountLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    [children]
  );
}
export default AccountLayout;
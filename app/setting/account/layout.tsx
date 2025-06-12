import { type Metadata } from "next";

export const metadata: Metadata = {
  title: 'Setting: Account | Panta'
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
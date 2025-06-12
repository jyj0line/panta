import { type Metadata } from "next";

export const metadata: Metadata = {
  title: 'Change Password'
};

const ChangepasswordLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    [children]
  );
}
export default ChangepasswordLayout;
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Change Password'
  }
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
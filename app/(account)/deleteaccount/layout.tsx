import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | Panta',
    default: 'Delete Account'
  }
};

const DeleteAccountLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    [children]
  );
}
export default DeleteAccountLayout;
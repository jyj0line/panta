import { type Metadata } from "next";

import { ChangePasswordForm } from "@/app/components/settingAccount/ChangePasswordForm";

export const metadata: Metadata = {
  title: 'Change Password'
};

const ChangepasswordPage = () => {
  return (
    <ChangePasswordForm />
  );
}
export default ChangepasswordPage;
import { type Metadata } from "next";

import { DeleteAccountForm } from "@/app/components/settingAccount/DeleteAccountForm";

export const metadata: Metadata = {
  title: 'Delete Account'
};

const DeleteaccountPage = () => {
  return (
    <DeleteAccountForm />
  )
}
export default DeleteaccountPage;
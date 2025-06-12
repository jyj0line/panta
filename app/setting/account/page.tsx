import type { LinkItem } from "@/app/components/setting/SettingContainer";
import { SettingContainer } from "@/app/components/setting/SettingContainer";

const ACCOUNT_SECURITY_LINK_ITMES: LinkItem[] = [
    {href: "/changepassword", description: "Change password"}
];
const DELETE_ACCOUNT_LINK_ITMES: LinkItem[] = [
    {href: "/deleteaccount", description: "Delete account"}
];
const AccountPage = () => {
    return(
        <div className="flex flex-col items-center gap-[2rem] w-full px-[1rem] py-[3rem]">
            <SettingContainer type="plain" heading="Account Security" linkItems={ACCOUNT_SECURITY_LINK_ITMES} />
            <SettingContainer type="critical" heading="Delete Account" linkItems={DELETE_ACCOUNT_LINK_ITMES} />
        </div>
    )
}
export default AccountPage;
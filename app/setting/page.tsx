import { type Metadata } from "next";

import { ToastBundleProvider } from "@/app/lib/contexts/ToastBundleContext";
import { UserId } from "@/app/components/setting/UserId";
import { ProfileImageForm } from "@/app/components/setting/ProfileImageForm";
import { BioForm } from "@/app/components/setting/BioForm";

export const metadata: Metadata = {
  title: 'Setting: Profile'
};

const SettingPage = () => {
    return(
        <ToastBundleProvider>
            <main
                className="
                    flex
                    flex-col items-center divide-y-[0.1rem]
                    sm:flex-row sm:items-start sm:divide-x-[0.1rem] sm:divide-y-[0rem]
                    w-full px-[1rem] py-[3rem]
                    divide-supersub
                "
            >
                <ProfileImageForm className="gap-[1rem] h-[16rem] sm:h-[12rem] p-[2rem] sm:py-[0rem]"/>

                <div className="flex flex-col gap-[1rem] w-full h-[16rem] sm:h-[12rem] p-[2rem] sm:py-[0rem]">
                    <UserId
                        className="truncate leading-[1.25] text-[2rem] font-[500]"
                        skeletionClassName="w-[10rem] h-[2.4rem]"
                    />
                    <BioForm className="gap-[1rem] w-full h-[8.5rem]" />
                </div>
            </main>
        </ToastBundleProvider>
    )
}
export default SettingPage;
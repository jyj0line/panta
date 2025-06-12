"use client";

import { useState, useEffect } from "react";

import { updateBioASF } from "@/app/lib/SFs/afterAuthSFs";
import { useSCtxedUserContext } from "@/app/lib/contexts/SCtxedUserContext";
import { useToastBundleContext, makeToastOrder } from "@/app/lib/contexts/ToastBundleContext";
import { ScrollTextareaInput } from "@/app/components/leaves/ScrollTextareaInput";
import { IngButton } from "@/app/components/leaves/IngButton";

import { USER, SUCCESS, ERROR } from '@/app/lib/constants';
const {
    UPDATE_BIO_SUCCESS
} = SUCCESS;
const {
    PLEASE_TRY_AGAIN_LATER_ERROR,
    UPDATE_INFO_SOMETHING_ERROR,

    UPDATE_BIO_SOMETHING_ERROR
} = ERROR;
const {
    USER_BIO_MAX
} = USER;

type SubmitRes = {
    success: true;
    message: string;
} | {
    success: boolean;
    message: string;
    error?: string[]
};
type BioFormProps = {
    className: string;
}
export const BioForm = ({className}: BioFormProps) => {
    const {user, isUserFirstLoading, updateSessionUser} = useSCtxedUserContext();
    const { addToast } = useToastBundleContext();

    const [bio, setBio] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isIng = isUserFirstLoading || isSubmitting;

    const handleSubmit = async () => {
        if (isIng) {
            alert(PLEASE_TRY_AGAIN_LATER_ERROR);
            return;
        }

        setIsSubmitting(true);
        try {
            const updateBioRes = await updateBioASF(bio);
            if (!updateBioRes.success) {
                addToast(makeToastOrder(UPDATE_BIO_SOMETHING_ERROR, false));
                return;
            }

            const updateRes = await updateSessionUser({_update: {profile_image_url: true, bio: true}});
            if (!updateRes.success) {
                addToast(makeToastOrder(UPDATE_INFO_SOMETHING_ERROR, false));
                return;
            }

            addToast(makeToastOrder(UPDATE_BIO_SUCCESS, true));
        } catch(_) {
            addToast(makeToastOrder(UPDATE_BIO_SOMETHING_ERROR, false));
        } finally{
            setIsSubmitting(false);
        }
    }

    useEffect(()=>{
        if (!isUserFirstLoading) {
            setBio(user?.bio ?? '');
        }
    }, [isUserFirstLoading]);

    return (
        <form
            className={`flex flex-col ${className} ${isIng ? "pointer-events-none" : ""}`}
        >   
            {isUserFirstLoading && <div className="w-full h-[8.5rem] rounded-[0.5rem] bg-supersub animate-pulse"></div>}
            {!isUserFirstLoading &&
            <ScrollTextareaInput
                name="bio"
                readOnly={isIng}
                value={bio}
                placeholder="Enter you bio."
                maxLength={USER_BIO_MAX}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-[8.5rem] rounded-[0.5rem] bg-transparent"
            />}
            <IngButton
                type="button"
                isIng={isSubmitting}
                onClick={handleSubmit}
                className="w-full h-[2.5rem] p-[0.5rem] text-background bg-foreground"
            >
                Update
            </IngButton>
        </form>
    )
}
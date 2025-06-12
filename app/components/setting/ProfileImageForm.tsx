"use client";

import { useState } from "react";

import { genSignatureSF, updateProfileImageUrlASF, deleteProfileImageUrlASF, deleteProfileImageFileSF } from "@/app/lib/SFs/afterAuthSFs";
import { uploadImageCF } from "@/app/lib/publicCFs";
import { useSCtxedUserContext } from "@/app/lib/contexts/SCtxedUserContext";
import { useToastBundleContext, makeToastOrder } from "@/app/lib/contexts/ToastBundleContext";
import { ProfileImageSelector } from "@/app/components/leaves/ProfileImageSelector";
import { IngButton } from "@/app/components/leaves/IngButton";

import { SUCCESS, ERROR } from "@/app/lib/constants";
const {
    CREATE_PROFILE_IMAGE_SUCCESS,
    CHANGE_PROFILE_IMAGE_SUCCESS,
    DELETE_PROFILE_IMAGE_SUCCESS
} = SUCCESS;
const {
    PLEASE_TRY_AGAIN_LATER_ERROR,

    CREATE_PROFILE_IMAGE_SOMETHING_ERROR,
    CHANGE_PROFILE_IMAGE_SOMETHING_ERROR,
    DELETE_PROFILE_IMAGE_SOMETHING_ERROR,
    UPDATE_PROFILE_IMAGE_SOMETHING_ERROR
} = ERROR;

const create_success_toast_order = makeToastOrder(
  CREATE_PROFILE_IMAGE_SUCCESS,
  true
);
const create_error_toast_order = makeToastOrder(
  CREATE_PROFILE_IMAGE_SOMETHING_ERROR,
  false
);
const change_success_toast_order = makeToastOrder(
  CHANGE_PROFILE_IMAGE_SUCCESS,
  true
);
const change_error_toast_order = makeToastOrder(
  CHANGE_PROFILE_IMAGE_SOMETHING_ERROR,
  false
);
const delete_success_toast_order = makeToastOrder(
  DELETE_PROFILE_IMAGE_SUCCESS,
  true
);
const delete_error_toast_order = makeToastOrder(
  DELETE_PROFILE_IMAGE_SOMETHING_ERROR,
  false
);
const update_error_toast_order = makeToastOrder(
  UPDATE_PROFILE_IMAGE_SOMETHING_ERROR,
  false
);

type ProfileImageFormProps = {
    className?: string
}
export const ProfileImageForm = ({ className="h-[10rem]" }: ProfileImageFormProps) => {
    const {addToast} = useToastBundleContext();
    const { user, isUserFirstLoading, updateSessionUser } = useSCtxedUserContext();

    const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
    const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
    const [isNewProfileImageUrlLoading, setNewIsProfileImageLoading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const isIng = isUserFirstLoading || isNewProfileImageUrlLoading || isSubmitting;
    const createCondition = !user?.profile_image_url && !!newProfileImageFile;
    const changeCondition = !!user?.profile_image_url && !!newProfileImageFile;
    const deleteCondition = !!user?.profile_image_url && !newProfileImageFile;

    const handleCreateSubmit = async () => {
        if (isIng || !createCondition) {
            alert(PLEASE_TRY_AGAIN_LATER_ERROR);
            return;
        }
    
        setIsSubmitting(true);
        try {
            const signatureRes = await genSignatureSF();
            if (!signatureRes.success) {
                addToast(create_error_toast_order);
                return;
            }
 
            const secureUrlRes = await uploadImageCF(newProfileImageFile, signatureRes);
            if (!secureUrlRes.success) {
                addToast(create_error_toast_order);
                return;
            }

            const updateProfileImageUrlRes = await updateProfileImageUrlASF(secureUrlRes.secureUrl);
            if (!updateProfileImageUrlRes.success) {
                addToast(create_error_toast_order);
                return;
            }

            const updateRes = await updateSessionUser({_update: {profile_image_url: true, bio: true}});
            if (!updateRes.success) {
                addToast(update_error_toast_order);
                return;
            }

            addToast(create_success_toast_order);
            setNewProfileImageFile(null);
            setNewPreviewUrl(null);
        } catch (_) {
            addToast(create_error_toast_order);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeSubmit = async () => {
        if (isIng || !changeCondition) {
            alert(PLEASE_TRY_AGAIN_LATER_ERROR);
            return;
        }

        setIsSubmitting(true);
        try {
            const signatureRes = await genSignatureSF();
            if (!signatureRes.success) {
                addToast(change_error_toast_order);
                return;
            }

            const secureUrlRes = await uploadImageCF(newProfileImageFile, signatureRes);
            if (!secureUrlRes.success) {
                addToast(change_error_toast_order);
                return;
            }
            const updateProfileImageUrlRes = await updateProfileImageUrlASF(secureUrlRes.secureUrl);
            if (!updateProfileImageUrlRes.success) {
                addToast(change_error_toast_order);
                return;
            }
            
            const deleteImageFileRes = await deleteProfileImageFileSF();
            if (!deleteImageFileRes.success) {
                addToast(change_error_toast_order);
                return;
            }
            
            const updateRes = await updateSessionUser({_update: {profile_image_url: true, bio: true}});
            if (!updateRes.success){
                addToast(update_error_toast_order);
                return;
            }

            addToast(change_success_toast_order);
            setNewProfileImageFile(null);
            setNewPreviewUrl(null);
        } catch (_) {
            addToast(change_error_toast_order);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (isIng || !deleteCondition) {
            alert(PLEASE_TRY_AGAIN_LATER_ERROR);
            return;
        }
    
        setIsSubmitting(true);
        try {
            const deleteImageFileRes = await deleteProfileImageFileSF();
            if (!deleteImageFileRes.success) {
                addToast(delete_error_toast_order);
                return;
            }

            const deleteProfileImageUrlRes = await deleteProfileImageUrlASF();
            if (!deleteProfileImageUrlRes.success) {
                addToast(delete_error_toast_order);
                return;
            }

    
            const updateRes = await updateSessionUser({_update: {profile_image_url: true, bio: true}});
            if (!updateRes.success) {
                addToast(update_error_toast_order);
                return;
            }

            addToast(delete_success_toast_order);
            setNewProfileImageFile(null);
            setNewPreviewUrl(null);
        } catch (_) {
            addToast(delete_error_toast_order);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form
            className={`
                flex flex-col ${className}
                ${isIng ? 'pointer-events-none': ''}
            `}
        >   
            <ProfileImageSelector
                initialPreviewUrl={user?.profile_image_url ?? null}
                isInitialPreviewUrlLoading={isUserFirstLoading}
                newPreviewUrl={newPreviewUrl}
                setNewPreviewUrl={setNewPreviewUrl}
                isNewPreviewUrlLoading={isNewProfileImageUrlLoading}
                setIsNewPreviewUrlLoading={setNewIsProfileImageLoading}
                onChange={(file) => setNewProfileImageFile(file)}
                className='w-[8.5rem] h-[8.5rem]'
            />
            {createCondition &&
            <IngButton
                type="button"
                isIng={isSubmitting}
                onClick={handleCreateSubmit}
                className="w-[8.5rem] h-[2.5rem] p-[0.5rem] text-background bg-foreground"
            >
                Create Image
            </IngButton>
            }
            {changeCondition &&
            <IngButton
                type="button"
                isIng={isSubmitting}
                onClick={handleChangeSubmit}
                className="w-[8.5rem] h-[2.5rem] p-[0.5rem] text-background bg-foreground"
            >
                Change Image
            </IngButton>
            }
            {deleteCondition &&
            <IngButton
                type="button"
                isIng={isSubmitting}
                onClick={handleDeleteSubmit}
                className="w-[8.5rem] h-[2.5rem] p-[0.5rem] text-background bg-bad"
            >
                Delete Image
            </IngButton>}
        </form>
    );
};
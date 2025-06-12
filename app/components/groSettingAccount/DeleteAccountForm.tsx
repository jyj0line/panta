"use client";

import { useState } from "react";

import { useSCtxedUserContext } from "@/app/lib/contexts/SCtxedUserContext";
import { deleteUserASF } from "@/app/lib/SFs/afterAuthSFs";
import { validateIsChecked } from "@/app/lib/utils";
import { PasswordInput } from "@/app/components/leaves/PasswordInput";
import { CheckBox } from "@/app/components/leaves/CheckBox";
import { PrefixedMessage } from "@/app/components/leaves/PrefixedMessage";
import { IngButton } from "@/app/components/leaves/IngButton";
import { SuccessScreen } from "@/app/components/leaves/SuccessScreen";

import { SUCCESS, ERROR, DESCRIPTION } from '@/app/lib/constants';
const {
    DELETE_ACCOUNT_SUCCESS
} = SUCCESS;
const {
    PLEASE_TRY_AGAIN_LATER_ERROR,
    SOMETHING_WENT_WRONG_ERROR,

    DELETE_ACCOUNT_UNCHECKED_ERROR,
    LOG_OUT_SOMETHING_WENT_WRONG_ERROR,
    REFRESH_INFO_SOMETHING_ERROR
} = ERROR;
const {
    ACCOUNT_DELETION_NOTICE,
    ACCOINT_DELETION_BUTTON_NOTICE
} = DESCRIPTION;

type DeletingAccAfterMessages = {
    logout?: string,
    refreshSessionUser?: string
}

export const DeleteAccountForm = () => {
    const { refreshSessionUser } = useSCtxedUserContext();

    const [pw, setPw] = useState<string>("");
    const [showPw, setShowPw] = useState<boolean>(false);
    const [pwErrs, setPwErrs] = useState<string[]>([]);

    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isCheckedErrs, setIsCheckedErrs] = useState<string[]>([]);

    const [isDeletingAcc, setIsDeletingAcc] = useState<boolean>(false);
    const [deletingAccRes, setDeletingAccRes] = useState<string>('');
    const [isAccDeleted, setIsAccDeleted] = useState<boolean>(false);
    const [deletingAccAfterMessages, setDeletingAccAfterMessages] = useState<DeletingAccAfterMessages>({});

    const isErrs = pwErrs.length > 0 || isCheckedErrs.length > 0;

    const handleSubmit = async () => {
        if (isDeletingAcc) {
            alert(PLEASE_TRY_AGAIN_LATER_ERROR);
            return;
        }

        setIsDeletingAcc(true);
        let successFlag = false;
        const writingDeletingAccAfterMessages:DeletingAccAfterMessages = {
            logout: LOG_OUT_SOMETHING_WENT_WRONG_ERROR,
            refreshSessionUser: REFRESH_INFO_SOMETHING_ERROR
        };
        try {
            const deleteUserRes = await deleteUserASF({pw, isChecked});
            if (deleteUserRes.success) successFlag = true;
            if (!deleteUserRes.success) {
                setDeletingAccRes(deleteUserRes.message);
                if (deleteUserRes.errors) {
                    setPwErrs(deleteUserRes.errors.pw ?? []);
                    setIsCheckedErrs(deleteUserRes.errors.isChecked ?? []);
                }
                return;
            }

            if (!deleteUserRes.afterMessages) {
                delete writingDeletingAccAfterMessages.logout;
            } else {
                writingDeletingAccAfterMessages.logout = deleteUserRes.afterMessages[0];
            }
            const refreshSessionUserRes = await refreshSessionUser();
            if (refreshSessionUserRes.success) {
                delete writingDeletingAccAfterMessages.refreshSessionUser;
            } else {
                writingDeletingAccAfterMessages.refreshSessionUser = refreshSessionUserRes.message;
            }
            
            setDeletingAccRes(deleteUserRes.message);
            setDeletingAccAfterMessages(writingDeletingAccAfterMessages);
            setIsAccDeleted(true);
        } catch(_) {
            setDeletingAccRes(SOMETHING_WENT_WRONG_ERROR);
            setDeletingAccAfterMessages(writingDeletingAccAfterMessages);
            if (successFlag) setIsAccDeleted(true);
        } finally {
            setIsDeletingAcc(false);
        }
    };

    if (isAccDeleted) {
        return (
            <SuccessScreen
                callbackUrl="/"
                successMessage={DELETE_ACCOUNT_SUCCESS}
                afterMessages={Object.values(deletingAccAfterMessages)}
            />
        )
    }
    return(
        <div className={`flex flex-col gap-[3rem] ${isDeletingAcc ? 'pointer-events-none' : ''}`}>
            <h1 className="text-[1.5rem] font-[500]">
                Delete Account
            </h1>

            <div className="flex flex-col items-start gap-[0.5rem]">
                <p>Please enter your password to confirm account deletion.</p>

                <PasswordInput
                    name="pw"
                    showPassword={showPw}
                    value={pw}
                    placeholder="Enter your password"
                    readOnly={isDeletingAcc}
                    onChange={(e) => setPw(e.target.value)}
                    className={`input ${pwErrs.length !== 0 ? 'border-bad' : ''}`}
                />
                <CheckBox
                    label="Show password"
                    isOn={showPw}
                    onClick={() => setShowPw((prev) => !prev)}
                    className='h-[1.5rem]'
                />

                <PrefixedMessage name="pw" messages={pwErrs} prefix="-" className="text-bad"/>
            </div>

            <div className="flex flex-col items-start gap-[0.5rem]">
                <p>Please check the box to confirm that you’ve read and agree to the account deletion notice.</p>

                <p className="text-[1.1rem] whitespace-pre-wrap font-[500] p-[1rem]"> {ACCOUNT_DELETION_NOTICE}</p>
                <CheckBox
                    label="Yes, I've read and agree to this account deletion notice."
                    isOn={isChecked}
                    onClick={() => setIsChecked((prev) => !prev)}
                    onBlur={() => { const isCheckedRes = validateIsChecked(isChecked, [DELETE_ACCOUNT_UNCHECKED_ERROR]); setIsCheckedErrs(isCheckedRes); }}
                    className='h-[1.5rem]'
                    uncheckedErrClassName={`${isCheckedErrs.length > 0 ? "fill-bad" : ""}`}
                />

                <PrefixedMessage name='isChecked' messages={isCheckedErrs} prefix="-" className="text-bad"/>
            </div>

            <div className='flex flex-col items-center gap-[0.1rem] w-full'>
                <p className="font-[500]">{ACCOINT_DELETION_BUTTON_NOTICE}</p>
                <PrefixedMessage
                    name="deleteAccount"
                    messages={isErrs ? deletingAccRes : undefined}
                    className='text-bad'
                />
                <IngButton
                    isIng={isDeletingAcc}
                    type="button"
                    onClick={handleSubmit}
                    className="p-[1rem] rounded-full text-background bg-bad"
                >
                    Delete Account
                </IngButton>
            </div>
        </div>
    )
}
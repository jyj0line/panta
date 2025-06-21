"use client";

import { useState } from "react";

import { updatePwASF } from "@/app/lib/SF/afterAuthSFs";
import { PasswordInput } from "@/app/components/atomic/PasswordInput";
import { CheckBox } from "@/app/components/atomic/CheckBox";
import { PrefixedMessage } from "@/app/components/atomic/PrefixedMessage";
import { IngButton } from "@/app/components/atomic/IngButton";
import { SuccessScreen } from "@/app/components/atomic/SuccessScreen";
import { validateUnhashedPassword, validateUnhashedPasswordForConfirm } from "@/app/lib/utils";

import { SUCCESS, ERROR, USER, DESCRIPTION } from '@/app/lib/constants';
const {
    CHANGE_PASSWORD_SUCCESS
} = SUCCESS;
const {
    PLEASE_TRY_AGAIN_LATER_ERROR,
    SOMETHING_WENT_WRONG_ERROR
} = ERROR;
const {
  USER_UNHASHED_PASSWORD_MAX,
} = USER;
const {
    USER_UNHASHED_PASSWORD_DESCRIPTION
} = DESCRIPTION;

export const ChangePasswordForm = () => {
    const [curPw, setCurPw] = useState<string>("");
    const [showCurPw, setShowCurPw] = useState<boolean>(false);
    const [curPwErrs, setCurPwErrs] = useState<string[]>([]);

    const [newPw, setNewPw] = useState<string>("");
    const [newPw2, setNewPw2] = useState<string>("");
    const [showNewPws, setShowNewPws] = useState<boolean>(false);
    const [newPwErrs, setNewPwErrs] = useState<string[]>([]);
    const [newPw2Errs, setNewPw2Errs] = useState<string[]>([]);

    const [isChangingPw, setIsChangingPw] = useState<boolean>(false);
    const [changingPwRes, setChangingPwRes] = useState<string>('');
    const [isPwChanged, setIsPwChanged] = useState<boolean>(false);

    const isErrs = curPwErrs.length > 0 || newPwErrs.length > 0 || newPw2Errs.length > 0;

    const handleSubmit = async () => {
        if (isChangingPw) {
            alert(PLEASE_TRY_AGAIN_LATER_ERROR);
            return;
        }

        setIsChangingPw(true);
        let successFlag = false;
        try {
            const updatePwRes = await updatePwASF({curPw, newPw, newPw2});
            if (updatePwRes.success) successFlag = true;
            if (!updatePwRes.success) {
                if (updatePwRes.errors) {
                    setCurPwErrs(updatePwRes.errors.curPw ?? []);
                    setNewPwErrs(updatePwRes.errors.newPw ?? []);
                    setNewPw2Errs(updatePwRes.errors.newPw2 ?? []);
                }
                setChangingPwRes(updatePwRes.message);
                return;
            }

            setChangingPwRes(updatePwRes.message);
            setIsPwChanged(true);
        } catch(e) {
            console.error(e);
            setChangingPwRes(SOMETHING_WENT_WRONG_ERROR);
            if (successFlag) setIsPwChanged(true);
        } finally {
            setIsChangingPw(false);
        }
    };

    if (isPwChanged) {
        return (
            <SuccessScreen
                callbackUrl="/"
                successMessage={CHANGE_PASSWORD_SUCCESS}
                afterMessages={[]}
            />
        )
    }
    return(
        <div className={`flex flex-col gap-[3rem] ${isChangingPw ? 'pointer-events-none' : ''}`}>
            <h1 className="text-[1.5rem] font-[500]">
                Change Password
            </h1>

            <div className="flex flex-col items-start gap-[0.5rem]">
                <p>Please enter your current password to proceed with the change.</p>

                <PasswordInput
                    name="curPw"
                    showPassword={showCurPw}
                    value={curPw}
                    placeholder="Enter your current password"
                    readOnly={isChangingPw}
                    onChange={(e) => setCurPw(e.target.value)}
                    className={`input ${curPwErrs.length !== 0 ? 'border-bad' : ''}`}
                />
                <CheckBox
                    label="Show current password"
                    isOn={showCurPw}
                    onClick={() => setShowCurPw((prev) => !prev)}
                    className='h-[1.5rem]'
                />

                <PrefixedMessage name="curPw" messages={curPwErrs} prefix="-" className="text-bad"/>
            </div>

            <div className="flex flex-col items-start gap-[0.5rem]">
                <p>Please enter your new password twice for confirmation.</p>

                <PasswordInput
                    name="newPw"
                    showPassword={showNewPws}
                    value={newPw}
                    placeholder="Enter your new password"
                    maxLength={USER_UNHASHED_PASSWORD_MAX}
                    readOnly={isChangingPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    onBlur={() => { const res = validateUnhashedPassword(newPw); setNewPwErrs(res); }}
                    className={`input ${newPwErrs.length !== 0 ? 'border-bad' : ''}`}
                />
                <PasswordInput
                    name="newPw2"
                    showPassword={showNewPws}
                    value={newPw2}
                    placeholder="Enter your new password again"
                    maxLength={USER_UNHASHED_PASSWORD_MAX}
                    readOnly={isChangingPw}
                    onChange={(e) => setNewPw2(e.target.value)}
                    onBlur={() => { const res = validateUnhashedPasswordForConfirm(newPw, newPw2); setNewPw2Errs(res); }}
                    className={`input ${newPw2Errs.length !== 0 ? 'border-bad' : ''}`}
                />
                <CheckBox
                    label="Show new passwords"
                    isOn={showNewPws}
                    onClick={() => setShowNewPws((prev) => !prev)}
                    className='h-[1.5rem]'
                />
                <p className="text-sub">{USER_UNHASHED_PASSWORD_DESCRIPTION}</p>

                <PrefixedMessage name="newPw" messages={newPwErrs} prefix="-" className="text-bad"/>
                <PrefixedMessage name="newPw2" messages={newPw2Errs} prefix="-" className="text-bad"/>
            </div>

            <div className='flex flex-col items-center gap-[0.1rem] w-full'>
                <PrefixedMessage
                    name="changePassword"
                    messages={isErrs ? changingPwRes : undefined}
                    className='text-bad'
                />
                <IngButton
                    isIng={isChangingPw}
                    type="button"
                    onClick={handleSubmit}
                    className="w-full p-[1rem] text-background bg-foreground"
                >
                    Change Password
                </IngButton>
            </div>
        </div>
    )
}
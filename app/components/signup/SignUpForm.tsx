'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";

import { genSignatureASF, updateProfileImageUrlASF } from '@/app/lib/SF/afterAuthSFs';
import { validateUserIdSF, signUpSF, loginSF } from '@/app/lib/SF/publicSFs';
import { uploadImageCF } from '@/app/lib/publicCFs';
import { useSyncFunction, useAsyncFunction } from '@/app/lib/hooks';
import { validateUnhashedPassword, validateUnhashedPasswordForConfirm, validateBio } from "@/app/lib/utils";
import { TextInput } from '@/app/components/atomic/TextInput';
import { PasswordInput } from '@/app/components/atomic/PasswordInput';
import { CheckBox } from '@/app/components/atomic/CheckBox';
import { ProfileImageSelector } from '@/app/components/atomic/ProfileImageSelector';
import { ScrollTextareaInput } from '@/app/components/atomic/ScrollTextareaInput';
import { PrefixedMessage } from '@/app/components/atomic/PrefixedMessage';
import { IngButton } from '@/app/components/atomic/IngButton';
import { SuccessScreen } from '@/app/components/atomic/SuccessScreen';

import { SpinnerSvg } from '@/app/lib/svgs';
import { ERROR, COMMON, USER, DESCRIPTION } from '@/app/lib/constants';
const {
  PLEASE_TRY_AGAIN_LATER_ERROR: PLEASE_TRY_AGAIN_LATER,

  USER_ID_SOMETHING_ERROR: USER_ID_SOMETHING,

  SIGN_UP_SOMETHING_ERROR: SIGN_UP_SOMETHING,
  SIGN_UP_INPUT_ERROR: SIGN_UP_INPUT,

  LOG_IN_SOMETHING_ERROR: LOG_IN_SOMETHING,
  
  CREATE_PROFILE_IMAGE_SOMETHING_ERROR: UPLOAD_PROFILE_IMAGE_SOMETHING,
  UPDATE_PROFILE_IMAGE_SOMETHING_ERROR: UPDATE_PROFILE_IMAGE_SOMETHING
} = ERROR;
const {
  PROFILE_IMAGE_SIZE_MAX
} = COMMON;
const {
  USER_ID_MIN,
  USER_ID_MAX,
  USER_UNHASHED_PASSWORD_MAX,
  USER_BIO_MAX
} = USER;
const {
  USER_UNHASHED_PASSWORD_DESCRIPTION
} = DESCRIPTION;

type SignUpFormSumbitState = {
  isSignedUp?: {
    success: boolean;
    message: string;
  },
  isLoggedIn?: {
    success: boolean;
    message: string;
  },
  isProfileImageUploaded?: {
    success: boolean;
    message: string;
  };
};
export const SignUpForm = () => {
  // navigation
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const { status, update } = useSession();
  
  // form inputs
  const [userId, setUserId] = useState('');
  const userIdRef = useRef<HTMLInputElement | null>(null);
  const [
    triggerUserIdSF,
    userIdErrors,
    setUserIdErrors,
    isUserIdLoading
  ] = useAsyncFunction({
    asyncFunc: validateUserIdSF,
    initialRes: [],
    fallbackRes: [USER_ID_SOMETHING],
    mountTrigger: false
});
  
  
  const [unhashedPassword, setUnhashedPassword] = useState('');
  const unhashedPasswordRef = useRef<HTMLInputElement | null>(null);
  const [
    triggerUnhashedPassword,
    unhashedPasswordErrors,
    setUnhashedPasswordErrors,
    isUnhashedPasswordLoading
  ] = useSyncFunction(
    validateUnhashedPassword,
    []
  );
  const [unhashedPasswordForConfirm, setUnhashedPasswordForConfirm] = useState('');
  const unhashedPasswordForConfirmRef = useRef<HTMLInputElement | null>(null);
  const [
    triggerUnhashedPasswordForConfirm,
    unhashedPasswordForConfirmErrors,
    setUnhashedPasswordForConfirmErrors,
    isUnhashedPasswordForConfirmLoading
  ] = useSyncFunction(
    validateUnhashedPasswordForConfirm,
    []
  );
  const [showPasswords, setShowPasswords] = useState(false);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  const [isProfileImageLoading, setIsProfileImageLoading] = useState(false);

  const [bio, setBio] = useState('');
  const bioRef = useRef<HTMLTextAreaElement | null>(null);
  const [
    triggerBio,
    bioErrors,
    setBioErrors,
    isBioLoading
  ] = useSyncFunction(
    validateBio,
    []
  );

  // submit
  const [submitRes, setSubmitRes] = useState<SignUpFormSumbitState>({});
  const callIdRef = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userIdErrLen = userIdErrors.length;
  const unhashedPasswordErrLen = unhashedPasswordErrors.length;
  const unhashedPasswordForConfirmErrLen = unhashedPasswordForConfirmErrors.length;
  const bioErrLen = bioErrors.length;
  const isIng =
    status === 'loading'
    || isUserIdLoading
    || isUnhashedPasswordLoading
    || isUnhashedPasswordForConfirmLoading
    || isBioLoading
    || isSubmitting
  ;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isIng) {
      alert(PLEASE_TRY_AGAIN_LATER);
      return;
    }

    const callId = ++callIdRef.current;
    setIsSubmitting(true);
    const ret: SignUpFormSumbitState = {
      isSignedUp: {
        success: false,
        message: SIGN_UP_SOMETHING
      },
      isLoggedIn: {
        success: false,
        message: LOG_IN_SOMETHING
      },
      isProfileImageUploaded: profileImage ? {
        success: false,
        message: UPLOAD_PROFILE_IMAGE_SOMETHING
      } : undefined
    };
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const signUpRes = await signUpSF(formData);
      if (callIdRef.current !== callId) return;
      ret.isSignedUp = {
        success: signUpRes.success,
        message: signUpRes.message
      };
      if (!signUpRes.success) {
        setUserIdErrors(signUpRes.errors?.user_id ?? []);
        setUnhashedPasswordErrors(signUpRes.errors?.unhashed_password ?? []);
        setUnhashedPasswordForConfirmErrors(signUpRes.errors?.unhashed_password_for_confirm ?? []);
        setBioErrors(signUpRes.errors?.bio ?? []);

        if (signUpRes.errors?.user_id?.length !== 0) {
          userIdRef.current?.focus();
        } else if (signUpRes.errors?.unhashed_password?.length !== 0) {
          unhashedPasswordRef.current?.focus();
        } else if (signUpRes.errors?.unhashed_password_for_confirm?.length !== 0) {
          unhashedPasswordForConfirmRef.current?.focus();
        } else if (signUpRes.errors?.bio?.length !== 0) {
          bioRef.current?.focus();
        }

        return;
      }

      const logInRes = await loginSF(formData);
      if (callIdRef.current !== callId) return;
      ret.isLoggedIn = logInRes;
      if (!logInRes.success) return;

      if (!profileImage) return;

      const signatureRes = await genSignatureASF();
      if (callIdRef.current !== callId) return;
      ret.isProfileImageUploaded = signatureRes;
      if (!signatureRes.success) return;

      const secureUrlRes = await uploadImageCF(profileImage, signatureRes);
      if (callIdRef.current !== callId) return;
      ret.isProfileImageUploaded = secureUrlRes;
      if (!secureUrlRes.success) return;

      const updateProfileImageUrlRes = await updateProfileImageUrlASF(secureUrlRes.secureUrl);
      if (callIdRef.current !== callId) return;
      ret.isProfileImageUploaded = updateProfileImageUrlRes;
      if (!updateProfileImageUrlRes.success) return;

      const updateRes = await update({_update: {profile_image_url: true}});
      if (callIdRef.current !== callId) return;
      if (!updateRes) {
        ret.isProfileImageUploaded = {
          success: false,
          message: UPDATE_PROFILE_IMAGE_SOMETHING
        };
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (callIdRef.current === callId) {
        setSubmitRes(ret);
        setIsSubmitting(false);
      }
    }
  };

  if (!isSubmitting && submitRes?.isSignedUp?.success) {
    return (
      <SuccessScreen
        callbackUrl={callbackUrl}
        successMessage={submitRes?.isSignedUp.message}
        afterMessages={Object.entries(submitRes)
          .filter(([key, item]) => key !== 'isSignedUp' && item?.success === false)
          .map(([, item]) => item?.message) }
        className='min-h-full'
      />
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`tiny_container flex flex-col items-center gap-[2rem] p-[1rem]
      ${isSubmitting ? 'pointer-events-none' : ''}`}
    >
      {/* heading start */}
      <h1 className="text-[1.75rem] leading-[2.5rem] font-[500] m-[1rem]">
        Sign up for Panta
      </h1>
      {/* heading end */}

      {/* form inputs start */}
      {/* ID input start */}
      <div className='flex flex-col gap-[0.1rem] w-full'>
        <h2
          className="
            text-[1.5rem] leading-[1.75rem] font-[500] py-[0.5rem]
            after:content-['*'] after:align-text-top after:text-bad
          "
        >
          ID
        </h2>

        <div
          className={`
            relative
            ${isUserIdLoading ? 'pointer-events-none animate-opacity-loading' : ''}
          `}
        >
          <TextInput
            ref={userIdRef}
            name="user_id"
            value={userId}
            placeholder='Enter your ID'
            maxLength={USER_ID_MAX}
            readOnly={isSubmitting}
            onChange={(e) => setUserId(e.target.value)}
            onBlur={() => triggerUserIdSF(userId)}
            className={`input ${userIdErrLen !== 0 ? 'border-bad' : ''}`}
          />
          {isUserIdLoading &&
          <SpinnerSvg
            className="
              absolute top-[50%] right-[0.5rem] -translate-y-[50%] aspect-square h-[1.5rem]
              opacity-[0] animate-spin-centered
            "
          />}
        </div>

        <div className='flex flex-col gap-[0.1rem] py-[0.25rem]'>
          <PrefixedMessage
            name="user_id"
            messages={userIdErrors}
            prefix='- '
            className='gap-[0.1rem] text-bad'
          />
          <p className='text-sub'>
            - Use {USER_ID_MIN} ~ {USER_ID_MAX} characters only with English charancters and numbers.
          </p>
        </div>
      </div>
      {/* ID input end */}

      {/* password inputs start */}
      <div className='flex flex-col gap-[0.1rem] w-full'>
        <h2
          className="
            text-[1.5rem] leading-[1.75rem] font-[500] py-[0.5rem]
            after:content-['*'] after:align-text-top after:text-bad
          "
        >
          Password
        </h2>

        <div className='flex flex-col gap-[0.1rem]'>
          <div
            className={`
              relative
              ${isUnhashedPasswordLoading ? 'pointer-events-none animate-opacity-loading' : ''}
            `}
          >
            <PasswordInput
              name="unhashed_password"
              showPassword={showPasswords}
              value={unhashedPassword}
              placeholder="Enter your password"
              maxLength={USER_UNHASHED_PASSWORD_MAX}
              readOnly={isSubmitting}
              onChange={(e) => setUnhashedPassword(e.target.value)}
              onBlur={() => triggerUnhashedPassword(unhashedPassword)}
              className={`input ${unhashedPasswordErrLen !== 0 ? 'border-bad' : ''}`}
            />
            {isUnhashedPasswordLoading &&
            <SpinnerSvg
              className="
                absolute top-[50%] right-[0.5rem] -translate-y-[50%] aspect-square h-[1.5rem]
                opacity-[0] animate-spin-centered
              "
            />}
          </div>

          <div
            className={`
              relative
              ${isUnhashedPasswordForConfirmLoading ? 'pointer-events-none animate-opacity-loading' : ''}
            `}
          >
            <PasswordInput
              name="unhashed_password_for_confirm"
              showPassword={showPasswords}
              value={unhashedPasswordForConfirm}
              placeholder="Enter your password again"
              maxLength={USER_UNHASHED_PASSWORD_MAX}
              readOnly={isSubmitting}
              onChange={(e) => setUnhashedPasswordForConfirm(e.target.value)}
              onBlur={() => triggerUnhashedPasswordForConfirm(unhashedPassword, unhashedPasswordForConfirm)}
              className={`input ${unhashedPasswordForConfirmErrLen !== 0 ? 'border-bad' : ''}`}
            />
            {isUnhashedPasswordForConfirmLoading &&
            <SpinnerSvg
              className="
                absolute top-[50%] right-[0.5rem] -translate-y-[50%] aspect-square h-[1.5rem]
                opacity-[0] animate-spin-centered
              "
            />}
          </div>
          
          <CheckBox
            label="Show passwords"
            isOn={showPasswords}
            onClick={() => setShowPasswords((prev) => !prev)}
            className='h-[1.5rem]'
          />
        </div>

        <div className='flex flex-col gap-[0.1rem] py-[0.25rem]'>
          <PrefixedMessage
            name="unhashed_password"
            messages={unhashedPasswordErrors}
            prefix='- '
            className='gap-[0.1rem] text-bad'
          />
          <PrefixedMessage
            name="unhashed_password_for_confirm"
            messages={unhashedPasswordForConfirmErrors}
            prefix='- '
            className='gap-[0.1rem] text-bad'
          />
          <p className='text-sub'>
            {USER_UNHASHED_PASSWORD_DESCRIPTION}
          </p>
        </div>
      </div>
      {/* password inputs end */}

      {/* profile image & bio inputs start */}
      <div className='flex flex-col gap-[0.1rem] w-full'>
        <h2 className="text-[1.5rem] leading-[1.75rem] font-[500] py-[0.5rem]">
          Profile Image & Bio
        </h2>

        <div className='relative flex flex-col sm:flex-row items-center gap-[1rem] sm:gap-[2rem]'>
          <ProfileImageSelector
            initialPreviewUrl={null}
            isInitialPreviewUrlLoading={false}
            newPreviewUrl={newPreviewUrl}
            setNewPreviewUrl={setNewPreviewUrl}
            isNewPreviewUrlLoading={isProfileImageLoading}
            setIsNewPreviewUrlLoading={setIsProfileImageLoading}
            onChange={(file) => setProfileImage(file)}
            className='w-[8.5rem] h-[8.5rem]'
          />

          <ScrollTextareaInput
            name="bio"
            readOnly={isIng}
            value={bio}
            placeholder="Enter you bio."
            maxLength={USER_BIO_MAX}
            onChange={(e) => setBio(e.target.value)}
            onBlur={() => triggerBio(bio)}
            className={`
              w-full h-[9.5rem] p-[1rem] rounded-[0.5rem]
              border-solid border-[0.1rem] border-supersub my-[0.5rem] placeholder:text-sub
              ${isBioLoading ? 'pointer-events-none animate-opacity-loading' : ''}
              ${bioErrLen !== 0 ? 'border-bad' : ''}
            `}
          />
          {isBioLoading &&
          <SpinnerSvg
            className="
              absolute bottom-[1.5rem] right-[1rem] aspect-square h-[1.5rem]
              opacity-[0] animate-opacity-spin-loading
            "
          />}
        </div>

        <div className='flex flex-col gap-[0.1rem] py-[0.25rem]'>
          <PrefixedMessage
            name="bio"
            messages={bioErrors}
            prefix='- '
            className='gap-[0.1rem] text-bad'
          />
          <p className='text-sub'>
           - Profile image file size must be no larger than {PROFILE_IMAGE_SIZE_MAX / 1024 / 1024} MB.
          </p>
          <p className='text-sub'>
           - Bio must be no more than {USER_BIO_MAX} characters long.
          </p>
        </div>
      </div>
      {/* profile image & bio inputs end */}

      <input type="hidden" name="redirectTo" value={callbackUrl} />
      {/* form inputs end */}

      {/* submit the form start */}
      <div className='flex flex-col items-center gap-[0.1rem] w-full m-[2rem]'>
        <PrefixedMessage
          name="sign_up"
          messages={(
            userIdErrLen !== 0
            || unhashedPasswordErrLen !== 0
            || unhashedPasswordForConfirmErrLen !== 0
            || bioErrLen !== 0)
            ? SIGN_UP_INPUT
            : submitRes?.isSignedUp?.message
        }
          className='text-bad'
        />

        <IngButton
          id="sign_up"
          type="submit"
          isIng={isSubmitting}
          onClick={()=>{}}
          className={`
            w-full bg-foreground text-background p-[1rem]
            ${isIng || isSubmitting ? 'opacity-[.5] pointer-events-none' : ''}
          `}
        >
          Sign Up
        </IngButton>
      </div>
      {/* submit the form end */}
    </form>
  );
};
"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';

import { ProfileImageSchema } from '@/app/lib/tables';
import { SelectImageSvg } from '@/app/lib/svgs';

import { ERROR, DEFAULT, COMMON } from '@/app/lib/constants';
const {
  SELECT_PROFILE_IMAGE_SOMETHING_ERROR
} = ERROR;
const {
  DEFAULT_PROFILE_IMAGE_URL
} = DEFAULT;
const {
  ACCEPTED_MIME_TYPES
} = COMMON;

type ProfileImageSelectorProps = {
  initialPreviewUrl: string | null
  isInitialPreviewUrlLoading: boolean

  newPreviewUrl: string | null
  setNewPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>

  isNewPreviewUrlLoading: boolean
  setIsNewPreviewUrlLoading: React.Dispatch<React.SetStateAction<boolean>>

  onChange: (file: File | null) => void

  className?: string
}
export const ProfileImageSelector = ({
  initialPreviewUrl,
  isInitialPreviewUrlLoading,
  newPreviewUrl,
  setNewPreviewUrl,
  isNewPreviewUrlLoading,
  setIsNewPreviewUrlLoading,
  onChange,
  className="h-[10rem]"
} : ProfileImageSelectorProps) => {
  const newProfileImageFileInputRef = useRef<HTMLInputElement>(null);
  const cidRef = useRef<number>(0);
  const isIng = isInitialPreviewUrlLoading || isNewPreviewUrlLoading;

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error());
        }
      };
  
      reader.onerror = () => {
        reject(new Error());
      };
  
      reader.readAsDataURL(file);
    });
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setIsNewPreviewUrlLoading(true);
    
    const file = e.target.files?.[0];

    if (newProfileImageFileInputRef.current) {
      newProfileImageFileInputRef.current.value = '';
    }

    const parsedProfileImageFile = ProfileImageSchema.safeParse(file);
    if (!parsedProfileImageFile.success) {
      alert(`${parsedProfileImageFile.error.errors.map(({message}) => `- ${message}`).join('\n')}`);

      setIsNewPreviewUrlLoading(false);

      return;
    }

    const validProfileimageFile = parsedProfileImageFile.data;
    
    const cid = ++cidRef.current;
    try {
      const newPreviewUrl = await readFileAsDataURL(validProfileimageFile);
      
      if (cid === cidRef.current) {
        onChange(validProfileimageFile);
        setNewPreviewUrl(newPreviewUrl);
      }
    } catch (_) {
      if (cid === cidRef.current) {
        alert(SELECT_PROFILE_IMAGE_SOMETHING_ERROR);
      }
    } finally {
      if (cid === cidRef.current) {
        setIsNewPreviewUrlLoading(false);
      }
    }
  };
  
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (newProfileImageFileInputRef.current) {
      newProfileImageFileInputRef.current.value = '';
    }

    onChange(null);
    setNewPreviewUrl(null);
  };

  const triggerFileInput = () => {
    newProfileImageFileInputRef.current?.click();
  };
  
  useEffect(() => {
    return () => {
      cidRef.current = 0;
    }
  }, []);
  
  return (
    <div
      className={`${isIng ? 'pointer-events-none' : ''} ${className}`}
    >  
      <input
        ref={newProfileImageFileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(", ")}
        readOnly={isIng}
        aria-readonly={isIng}
        onChange={handleSelect}
        className="hidden"
      />

      <div className="relative flex justify-center items-center w-auto h-full aspect-square">
        {isInitialPreviewUrlLoading &&
        <div className="w-auto h-full aspect-square rounded-full bg-supersub animate-pulse" />
        }
        {!isInitialPreviewUrlLoading &&
        <div className="relative w-auto h-full aspect-square">
          <Image 
            src={newPreviewUrl || initialPreviewUrl || DEFAULT_PROFILE_IMAGE_URL} 
            alt="profile image"
            fill
            sizes="75dvw"
            className="object-cover rounded-full bg-supersub"
          />

          <button
            type="button"
            disabled={isIng}
            aria-disabled={isIng}
            aria-label="Select your profile image."
            onClick={triggerFileInput}
            className="
              absolute -bottom-[0.5rem] -right-[1rem] flex items-center justify-center
              min-w-[2rem] w-[10%] h-auto aspect-square p-[0.1rem] rounded-full border-[0.1rem] border-sub
            "
          >
            <SelectImageSvg />
          </button>

          {newPreviewUrl &&
          <button
            type="button"
            disabled={isIng}
            aria-disabled={isIng}
            aria-label="Remove the selected profile image."
            onClick={handleRemove}
            className="
              absolute -top-[0.5rem] -right-[1rem] flex items-center justify-center
              min-w-[2rem] w-[10%] h-auto aspect-square rounded-full bg-bad text-background
            "
          >
            ⨉
          </button>}
        </div>}
      </div>
    </div>
  );
};
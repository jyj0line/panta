import type { GenSignatureSuccessRet } from "@/app/lib/SFs/afterAuthSFs";

import { SUCCESS, ERROR, COMMON } from "@/app/lib/constants";
const {
  CREATE_PROFILE_IMAGE_SUCCESS: UPLOAD_PROFILE_IMAGE
} = SUCCESS;
const {
  CREATE_PROFILE_IMAGE_SOMETHING_ERROR: UPLOAD_PROFILE_IMAGE_SOMETHING
} = ERROR;
const {
  UPLOAD_URL_PREFIX,
  UPLOAD_URL_SUFFIX
} =  COMMON;

type uploadSecureUrlRet = {
  success: true;
  message: string;
  secureUrl: string;
} | {
  success: false;
  message: string;
};
export const uploadImageCF = async (file: File, genSignatureRes: GenSignatureSuccessRet): Promise<uploadSecureUrlRet> => {
  try{
    const { cloudName, apiKey, signature, timestamp, asset_folder } = genSignatureRes;
    const url = UPLOAD_URL_PREFIX + cloudName + UPLOAD_URL_SUFFIX;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('asset_folder', asset_folder);

    const res = await fetch(url,
      {
        method: 'POST',
        body: formData,
      }
    );
    const jsonedRes = await res.json();
    return {
      success: true,
      message: UPLOAD_PROFILE_IMAGE,
      secureUrl: typeof jsonedRes.secure_url === 'string' ? jsonedRes.secure_url : undefined
    }
  } catch(_) {
    return {
      success: false,
      message: UPLOAD_PROFILE_IMAGE_SOMETHING
    }
  }
}
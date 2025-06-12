import { z } from "zod";

import { type GetAuthorCrumbDataRet } from '@/app/lib/SFs/publicSFs';
import { type UnhashedPassword, UserSchema, UnhashedPasswordSchema } from "@/app/lib/tables";
import { type Breadcrumb } from "@/app/components/leaves/Breadcrumbs";


import { ERROR } from "@/app/lib/constants";
const {
  UNHASHED_PASSWORD_FOR_CONFIRM_DIFF_ERROR: UNHASHED_PASSWORD_FOR_CONFIRM_DIFF
} = ERROR;

export type SearchParamValue = string | string[] | undefined;
export type SearchParams = { [key: string]: SearchParamValue };

export const CQSchema = z.object({
  chunk: z.number().int().nonnegative(),
  limit: z.number().int().min(1)
});
export type CQ = z.infer<typeof CQSchema>;
export const CSSchema = z.object({
  hasNextChunk: z.boolean(),
  totalCount: z.number().int().nonnegative().optional()
});
export type CS = z.infer<typeof CSSchema>;




export const validateUnhashedPassword = (unhashedPassword: UnhashedPassword): string[] => {
  const parsedUnhashedPassword = UnhashedPasswordSchema.safeParse(unhashedPassword);
  if (!parsedUnhashedPassword.success) {
    return parsedUnhashedPassword.error.errors.map(e => e.message);
  }

  return [];
}

export const validateUnhashedPasswordForConfirm = (unhashedPassword: UnhashedPassword, unhashedPasswordForConfirm: UnhashedPassword): string[] => {
  const isSame = unhashedPassword === unhashedPasswordForConfirm;
  if (!isSame) {
    return [UNHASHED_PASSWORD_FOR_CONFIRM_DIFF];
  }

  return [];
}

export const validateIsChecked = (isChecked: boolean, uncheckedMessage: string[]): string[] => {
  if (!isChecked) {
    return uncheckedMessage;
  }

  return [];
}

const BioSchema = UserSchema.shape.bio;
type Bio = z.infer<typeof UserSchema.shape.bio>;
export const validateBio = (bio: Bio): string[] => {
  const parsedBio = BioSchema.safeParse(bio);
  if (!parsedBio.success) {
    return parsedBio.error.errors.map(e => e.message);
  }

  return [];
}





export const parseSPVNaturalNumber = (value: SearchParamValue): number | null => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return null;
  
  const parsedCandidate = CQSchema.shape.chunk.safeParse(Number(candidate));

  return parsedCandidate.success ? parsedCandidate.data : null;
};

export const parseSPVToken = (value: SearchParamValue): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export const parseSPVString = (value: SearchParamValue): string => {
  if (!value) return '';
  return Array.isArray(value) ? value.join(' ') : value;
};

export const parseSPVDate = (value: SearchParamValue): string => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return '';
  
  const timestamp = Date.parse(candidate);
  return isNaN(timestamp) ? '' : new Date(timestamp).toISOString().slice(0, 10);
};

export const ORDER_CRITERIA = ['rank', 'created_at'] as const;
export const OrderCriticSchema = z.enum(
  ORDER_CRITERIA,
  { invalid_type_error: 'Please select an valid order critic.' }
);
export type OrderCritic = z.infer<typeof OrderCriticSchema>;
export const parseSPVOrderCritic = (value: SearchParamValue): OrderCritic => {
  const parsedValue = OrderCriticSchema.safeParse(value);
  if (parsedValue.success) return parsedValue.data;
  return "rank"
}

export const ORDER_DIRECTIONS = ['asc', 'desc'] as const;
export const OrderDirectionSchema = z.enum(
  ORDER_DIRECTIONS,
  { invalid_type_error: 'Please select an valid order direction.' }
);
export type OrderDirection = z.infer<typeof OrderDirectionSchema>;
export const parseSPVOrderDirection = (value: SearchParamValue): OrderDirection => {
  const parsedValue = OrderDirectionSchema.safeParse(value);
  if (parsedValue.success) return parsedValue.data;
  return 'desc';
}

export const areSameArraies = (array1: unknown[], array2: unknown[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }
  return array1.every((value, index) => value === array2[index]);
}





type GetSubscribeCrumbsParam = {
  authorId: GetAuthorCrumbDataRet["user_id"]
  profileImageUrl: GetAuthorCrumbDataRet["profile_image_url"],
  subscribe: "subscribed" | "subscribing"
}
export const getSubscribeCrumbs = ({authorId, profileImageUrl, subscribe}: GetSubscribeCrumbsParam): Breadcrumb[] => {
  return [
    {
      imageUrl: profileImageUrl,
      label: authorId,
      href: `/@${authorId}`,
      current: false,
      abled: true
    },

    {
        label: subscribe,
        href: `/@${authorId}/${subscribe}`,
        current: true,
        abled: false
    }
  ]
}
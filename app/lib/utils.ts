import type { UnhashedPassword } from "@/app/lib/tables";
import { UserSchema, UnhashedPasswordSchema } from "@/app/lib/tables";
import type { OrderCriteriaType } from '@/app/lib/sqls'

import { ERROR } from "@/app/lib/constants";
import { z } from "zod";
const {
  UNHASHED_PASSWORD_FOR_CONFIRM_DIFF_ERROR: UNHASHED_PASSWORD_FOR_CONFIRM_DIFF,
  DELETE_ACCOUNT_UNCHECKED_ERROR
} = ERROR;

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

export const getNaturalNumber = (value: string | string[] | undefined): number | undefined => {
  if (!value) return undefined;
  const valueToCheck = Array.isArray(value) ? value[0] : value;
  const num = Number(valueToCheck);
  return Number.isInteger(num) && num > 0 ? num : undefined;
};





export const parseToken = (value: string | string[] | undefined): string[] => {
  if (!value || (Array.isArray(value) && value.length === 0)) return [];
  return Array.isArray(value) ? value : [value];
}

export const parseString = (value: string | string[] | undefined): string | undefined => {
  if (!value || value === "" || (Array.isArray(value) && value.length === 0)) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

export const parseDate = (value: string | string[] | undefined): Date | undefined => {
  if (!value || (Array.isArray(value) && value.length === 0))  return undefined;
  const valueToCheck = Array.isArray(value) ? value[0] : value;
  const timestamp = Date.parse(valueToCheck);
  return isNaN(timestamp) ? undefined : new Date(timestamp)
};

export const parseOrderCriteria = (value: string | string[] | undefined): OrderCriteriaType => {
  if (value === "created_at") return value;
  return "rank"
}





export const areSameArraies = (array1: unknown[], array2: unknown[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }
  return array1.every((value, index) => value === array2[index]);
}

export const isSameDate = (value: string, date: Date | undefined): boolean => {
  if (!value && !date) return true;

  if (!value || !date) return false;

  const [year, month, day] = value.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
};
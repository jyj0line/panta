import type { OrderCriteriaType } from '@/app/lib/sqls'

// authentification & authorization
export const getUserId = (): string => {
  return '0o0o0'
  //return 'hellohellohellohellohellohe'
}




/*
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {

  'use server'
  return bcrypt.hash(password, 10);
};
*/





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
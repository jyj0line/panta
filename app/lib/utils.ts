'use server'
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  'use server'
  return bcrypt.hash(password, 10);
};
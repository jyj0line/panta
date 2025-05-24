"use client";

import { useEffect } from "react";
{/*
// not applied yet
import { type Metadata } from "next";
*/}

import { NotFound } from "@/app/components/leaves/NotFound";

import { METADATA } from '@/app/lib/constants';
const {
  NOT_FOUND_TITLE_METADATA
} = METADATA;

{/*
// not applied yet
export const metadata: Metadata = {
  title: {
    absolute: NOT_FOUND_TITLE_METADATA
  }
};
*/}

const GlobalNotFound = () => {
  useEffect(() => {
    document.title = NOT_FOUND_TITLE_METADATA;
  }, []);

  return (
    <NotFound />
  );
}
export default GlobalNotFound;
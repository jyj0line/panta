"use client";

import { useEffect } from "react";

import { increasePageViewSF } from "@/app/lib/SFs/publicSFs";
import { type Page } from "@/app/lib/tables";

type PageViewUpdaterProps = {
    pageId: Page["page_id"]
}

export const PageViewUpdater = ({ pageId }: PageViewUpdaterProps) => {
    useEffect(() => {
        increasePageViewSF(pageId);
    }, [pageId]);

    return null;
}
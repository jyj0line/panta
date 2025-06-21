"use client";

import { useIsVisibleAndIsSticky } from '@/app/lib/hooks';

const THRESHHOLD = 100;
const THROTTLE_TIME = 100;

type StickyDivProps = {
  direction?: "top" | "bottom"
  effect?: "border" | "shadow"
  isStickyEffect?: boolean
  className?: string
  children?: React.ReactNode
}
export const StickyDiv = ({ direction="top", effect="border", isStickyEffect=true, className, children }: StickyDivProps) => {
  const directionCn = direction === "top" ? "top-[0px]" : "bottom-[0px]";
  const translateCn = direction === "top" ? "-translate-y-full" : "translate-y-full";
  const effectCn = effect === "border"
    ? direction === "top" ? "border-b-[0.1rem]" : "border-t-[0.1rem]"
    : "shadow-lg";

  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: THRESHHOLD, throttleTime: THROTTLE_TIME});
  const stickyBorderCnCon = isStickyEffect ? isVisible && isSticky : isVisible;

  return (
      <div className={`
        sticky ${directionCn} z-[30] bg-background ${className}
        transition-transform ${isVisible ? '' : translateCn}
        ${stickyBorderCnCon ? `${effectCn} border-supersub` : ''}
      `}>
          {children}
      </div>
  );
};
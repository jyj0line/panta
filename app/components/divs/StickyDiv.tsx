"use client";

import { useIsVisibleAndIsSticky } from '@/app/lib/hooks';

const THRESHHOLD = 100;
const THROTTLE_TIME = 100;

type StickyDivProps = {
  type?: "top" | "bottom"
  className?: string
  children?: React.ReactNode
}
export const StickyDiv = ({ type="top", className, children }: StickyDivProps) => {
  const tcn = type === "top" ? "top-[0px]" : "bottom-[0px]";
  const isNotVisibleTcn = type === "top" ? "-translate-y-full" : "translate-y-full";
  const dividedByTcn = type === "top" ? "border-b-[0.1rem]" : "border-t-[0.1rem]";

  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: THRESHHOLD, throttleTime: THROTTLE_TIME});
  
  return (
      <div className={`
        sticky ${tcn} z-[10] bg-background ${className}
        transition-transform ${isVisible ? '' : isNotVisibleTcn}
        ${isVisible && isSticky? `${dividedByTcn} border-supersub` : ''}`}>
          {children}
      </div>
  );
};
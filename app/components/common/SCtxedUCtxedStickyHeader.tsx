"use client";

import { useIsVisibleAndIsSticky } from '@/app/lib/hooks';
import type { SCtxedUCtxedHeaderProps } from '@/app/components/common/SCtxedUCtxedHeader';
import { SCtxedUCtxedHeader } from '@/app/components/common/SCtxedUCtxedHeader';

const THRESHHOLD = 100;
const THROTTLE_TIME = 100;

type SCtxedUCtxedStickyHeaderProps = SCtxedUCtxedHeaderProps & {
  children?: React.ReactNode
}
export const SCtxedUCtxedStickyHeader = ({showSearch, authorId, className="h-[2rem]", children}: SCtxedUCtxedStickyHeaderProps) => {
  const { isVisible, isSticky } = useIsVisibleAndIsSticky({threshold: THRESHHOLD, throttleTime: THROTTLE_TIME});
  
  return (
      <div className={`
        sticky top-0 z-[10] bg-background
        transition-transform ${isVisible ? '' : '-translate-y-full'}
        ${isVisible && isSticky? 'shadow-md' : ''}`}>
        <div className='container'>
          <SCtxedUCtxedHeader showSearch={showSearch} authorId={authorId} className={className}/>
          {children}
        </div>
      </div>
  );
};
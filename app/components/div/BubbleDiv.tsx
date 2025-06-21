"use client";

import { useState, useRef } from "react";

type BubbleDivProps = {
  bubbles: React.ReactNode
  children?: React.ReactNode
  bubblableClassName?: string,
  className?: string
  bubblesClassName?: string
}
export const BubbleDiv = ({
  bubbles,
  children,
  bubblableClassName,
  className,
  bubblesClassName,
}: BubbleDivProps) => {
  const [isBubbled, setIsBubbled] = useState<boolean>(true);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const toggeIsBubbled = (e: React.MouseEvent<HTMLDivElement>) => { 
    if (bubbleRef.current && bubbleRef.current.contains(e.target as Node)) {
      return;
    }
    
    setIsBubbled(prev => !prev); 
  }; 

    return (
      <div onClick={toggeIsBubbled} className={`z-[10] ${bubblableClassName}`}>
        <div className={`relative flex flex-row ${className}`}>
          {children}

          <div
            ref={bubbleRef}
            className={`
              sticky w-[0px] h-[0px] overflow-visible
              ${isBubbled ? 'block' : 'hidden'}
              ${bubblesClassName}
            `}
          >
            {bubbles}
          </div>
        </div>
      </div>
    )
}
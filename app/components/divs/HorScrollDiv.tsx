"use client";

import { useRef, useEffect, ReactNode } from 'react';

type HorScrollDivProps = {
    scrollSpeed: number;
    children: ReactNode;
    className?: string;
}

export const HorScrollDiv = ({ 
    scrollSpeed,
    children, 
    className, 
}: HorScrollDivProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                return;
            }

            const delta = e.deltaY * scrollSpeed;
            element.scrollLeft += delta;
            
            e.preventDefault();
        };

        element.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            element.removeEventListener('wheel', handleWheel);
        };
    }, [scrollSpeed]);

    return (
        <div
            ref={scrollRef}
            className={`overflow-x-auto overflow-y-hidden ${className}`}
        >
            {children}
        </div>
    );
};
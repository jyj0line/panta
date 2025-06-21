"use client";

import { useState, useEffect, useRef } from "react";

import { type Toast, useToastBundleContext } from "@/app/lib/context/ToastBundleContext";
import { CloseSvg, LeftSvg, RightSvg, ArrowDropdownSvg, ArrowDropupSvg } from "@/app/lib/svgs";

const UNMOUNT_DELAY = 5000;

export const ToastBundle = () => {
    const {
        toasts,
        currentIndex,
        setCurrentIndex,
        prevToastsLength,
        removeToast,
        removeAllToasts
    } = useToastBundleContext();

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const unmountTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    
    const handleClose = (toastId: string): void => {
        removeToast(toastId);
    };

    const handleAllClose = (): void => {
        removeAllToasts();
    };

    const handleToPrevToast = (): void => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };
    
    const handleToNextToast = (): void => {
        setCurrentIndex(prev => Math.min(toasts.length - 1, prev + 1));
    };
    
    const toggleIsDropdownOpen = (): void => {
        setIsDropdownOpen(prev => !prev);
    };

    useEffect(() => {
        const currentToastsLen = toasts.length;

        if (currentToastsLen === 0) {
            setIsDropdownOpen(false);
            return;
        }
        
        if (currentToastsLen === 1 && (prevToastsLength === 0 || prevToastsLength === 1)) {
            if (unmountTimeoutIdRef.current) {
                clearTimeout(unmountTimeoutIdRef.current);
            }
            
            unmountTimeoutIdRef.current = setTimeout(() => {
                removeToast(toasts[0].toastId);
                unmountTimeoutIdRef.current = null;
            }, UNMOUNT_DELAY);
        } else if (currentToastsLen > 1 && unmountTimeoutIdRef.current) {
            clearTimeout(unmountTimeoutIdRef.current);
            unmountTimeoutIdRef.current = null;
        }
    }, [toasts]);

    const currentToast = toasts[currentIndex];
    const willUnmounted = (toasts.length === 1 && (prevToastsLength === 0 || prevToastsLength === 1));

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-[2rem] right-[2rem] flex flex-col items-end gap-[0.5rem] z-[50]">
            {/* current toast start */}
            <div key={currentToast.count} className={`relative ${willUnmounted ? "animate-opacity-unmount" : ''}`}>
                <Toast
                    toastId={currentToast.toastId}
                    message={currentToast.message}
                    count={currentToast.count}
                    className={currentToast.className}
                    onClose={handleClose}
                />
                
                {willUnmounted &&
                <div
                    className={`
                        absolute bottom-[0rem] w-full h-[0.5rem] animate-unmount-progressbar
                        ${currentToast.progressbarClassName}
                    `}>
                </div>}

                {toasts.length > 1 && (
                <div
                    className="
                        absolute bottom-[0rem] flex flex-row justify-between items-center
                        w-full px-[0.5rem] text-[0.9rem]
                    "
                >
                    <div className="w-[1rem] h-[0.5rem]"></div>

                    <div className="flex flex-row gap-[0.1rem]">
                        <div className="w-[1.5rem] h-[1.5rem]">
                            {currentIndex !== 0 &&
                            <button
                                type="button"
                                aria-label="to the previous toast"
                                onClick={handleToPrevToast}
                                className="w-full h-full"
                            >
                                <LeftSvg className="w-full h-full fill-background" />
                            </button>}
                        </div>
                        
                        <span className="flex justify-center items-center">
                            {currentIndex + 1} / {toasts.length}
                        </span>
                        
                        <div className="w-[1.5rem] h-[1.5rem]">
                            {currentIndex !== toasts.length - 1 &&
                            <button
                                type="button"
                                aria-label="to the next toast"
                                onClick={handleToNextToast}
                                className="w-full h-full"
                            >
                                <RightSvg className="w-full h-full fill-background"/>
                            </button>}
                        </div>
                    </div>

                    <button 
                        type="button"
                        aria-label="see all toasts"
                        onClick={toggleIsDropdownOpen}
                        className="w-[0.8rem] h-[0.4rem]"
                    >
                        {isDropdownOpen ?
                        <ArrowDropupSvg className="w-full h-full fill-background" /> :
                        <ArrowDropdownSvg className="w-full h-full fill-background" />}
                    </button>
                </div>)}
            </div>
            {/* current toast end */}
            
            {/* dropdowned toast list start */}
            {isDropdownOpen &&
            <ToastList
                toasts={toasts}
                onClose={handleClose}
                onAllClose={handleAllClose}
                className="max-h-[30rem]"
            />}
            {/* dropdowned toast list end */}
        </div>
    );
};

type ToastProps = Toast & {
    onClose: (toastId: string) => void
}
const Toast = ({ toastId, message, count, className, onClose }: ToastProps) => {
    return (
        <div className={`relative w-[20rem] h-[7rem] p-[1.5rem] shadow-lg ${className}`}>
            <div className="h-[3.5rem] pr-[0.2rem] overflow-y-auto hide_scrollbar">
                {count > 1 && (
                <span
                    className="
                        px-[0.3rem] py-[0.1rem] mr-[0.4rem] text-[0.9rem] rounded-full
                        font-[500] text-foreground bg-background
                    "
                >
                    {count}
                </span>
                )}
                <span className="break-words">{message}</span>
            </div>

            <button
                type="button"
                onClick={() => onClose(toastId)}
                className="absolute top-[0.5rem] right-[0.5rem] w-[0.8rem] h-[0.8rem]"
            >
                <CloseSvg className="stroke-[10] stroke-background"/>
            </button>
        </div>
    );
};

type ToastListProps = {
    toasts: Toast[]
    onClose: (toastId: string) => void
    onAllClose: () => void
    className?: string
}
const ToastList = ({ toasts, onClose, onAllClose, className="h-[30rem]" }: ToastListProps) => {
    return (
        <div className={`flex flex-col gap-[0.1rem] w-[25rem] bg-supersub shadow-lg ${className}`}>
            <div className="flex flex-col divide-y-[0.1rem] h-full border-background overflow-y-auto hide_scrollbar">
                {toasts.map((_, index, toasts) => {
                const reversedIndex = toasts.length - 1 - index;
                const toast = toasts[reversedIndex];

                return (
                <div key={toast.toastId} className="relative p-[1.5rem]">
                    {toast.count > 1 && (
                    <span
                        className="
                            px-[0.3rem] py-[0.1rem] mr-[0.4rem] text-[0.9rem] rounded-full
                            font-[500] text-foreground bg-background
                        "
                    >
                        {toast.count}
                    </span>
                    )}
                    <span className="break-words">{toast.message}</span>

                    <button
                        onClick={() => onClose(toast.toastId)}
                        className="absolute top-[0.5rem] right-[0.5rem] w-[0.8rem] h-[0.8rem]"
                    >
                        <CloseSvg className="stroke-[10]"/>
                    </button>
                </div>)})}
            </div>
            
            <div className="flex flex-row justify-end items-center gap-[0.5rem] h-[2rem] pr-[0.5rem] bg-sub">
                <span className="text-background whitespace-nowrap">delete all</span>
                <button
                    type="button"
                    onClick={onAllClose}
                    className="flex justify-center items-center"
                >
                    <CloseSvg className="w-[1rem] h-[1rem] stroke-[10] stroke-background"/>
                </button>
            </div>
        </div>
    )
}
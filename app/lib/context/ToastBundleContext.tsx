'use client';

import { createContext, useContext, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ToastBundle } from '@/app/components/atomic/ToastBundle';

export type ToastOrder = {
    message: string;
    className?: string;
    progressbarClassName?: string;
};

export type Toast = {
    toastId: string;
    count: number
} & ToastOrder;

const SUCCESS_CLASSNAME = "bg-em";
const SUCCESS_PROGRESSBAR_CLASSNAME = "bg-powerem";
const ERROR_CLASSNAME = "bg-bad";
const ERROR_PROGRESSBAR_CLASSNAME = "bg-powerbad";

export const makeToastOrder = (
  message: string,
  isSuccess: boolean
): ToastOrder => ({
  message,
  className: isSuccess ? SUCCESS_CLASSNAME : ERROR_CLASSNAME,
  progressbarClassName: isSuccess
    ? SUCCESS_PROGRESSBAR_CLASSNAME
    : ERROR_PROGRESSBAR_CLASSNAME,
});

type ToastBundleContextValue = {
    toasts: Toast[],
    currentIndex: number,
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>,
    prevToastsLength: number,
    addToast: (toastOrder: ToastOrder) => string,
    removeToast: (toastId: string) => void
    removeAllToasts: () => void
};

const ToastBundleContext = createContext<ToastBundleContextValue | null>(null);

export const ToastBundleProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const prevToastsLengthRef = useRef<number>(0);

    const addToast = (toastOrder: ToastOrder): string => {
        let newToastId = uuidv4();

        const lastToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;
        const isStacked = lastToast && lastToast.message === toastOrder.message;
        
        prevToastsLengthRef.current = toasts.length;

        if (isStacked) {
            newToastId = lastToast.toastId;

            setToasts(() => {
                const newToasts = [...toasts];

                const lastIndex = newToasts.length - 1;
                newToasts[lastIndex] = {
                    ...newToasts[lastIndex],
                    count: newToasts[lastIndex].count + 1,
                };

                return newToasts;
            });
        } else {
            setToasts(prevToasts => [
                ...prevToasts,
                {
                    toastId: newToastId,
                    message: toastOrder.message,
                    count: 1,
                    className: toastOrder.className,
                    progressbarClassName: toastOrder.progressbarClassName
                }
            ]);

            if (currentIndex === toasts.length - 1) {
                setCurrentIndex(toasts.length);
            }
        }
        
        return newToastId;
    };

    const removeToast = (toastId: string): void => {
        prevToastsLengthRef.current = toasts.length;
        
        const toastIndex = toasts.findIndex(toast => toast.toastId === toastId);
        
        if (toastIndex <= currentIndex) {
            setCurrentIndex(prevCurrentIndex => Math.max(0, prevCurrentIndex - 1));
        }
        
        setToasts(prevToasts => prevToasts.filter((_, index) => index !== toastIndex));
    };

    const removeAllToasts = (): void => {
        prevToastsLengthRef.current = 0;
        setCurrentIndex(0);
        setToasts([]);
    };

    return (
        <ToastBundleContext.Provider
            value={{
                toasts,
                currentIndex,
                setCurrentIndex,
                prevToastsLength: prevToastsLengthRef.current,
                addToast,
                removeToast,
                removeAllToasts
            }}
        >
            <ToastBundle />
            {children}
        </ToastBundleContext.Provider>
    );
};

export const useToastBundleContext = (): ToastBundleContextValue => {
    const context = useContext(ToastBundleContext);
    if (!context) {
        throw new Error("useToastBundleContext must be used within a ToastBundleProvider");
    }
    return context;
};
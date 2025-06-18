"use client";

import { useState } from "react";
import Link from "next/link";

import { deletePageASF } from "@/app/lib/SFs/afterAuthSFs";
import { useToastBundleContext, makeToastOrder } from "@/app/lib/contexts/ToastBundleContext";
import { useToggleVisibility } from "@/app/lib/hooks";
import { IngButton } from "@/app/components/leaves/IngButton";
import { ArrowDropdownSvg, CriticalSvg } from "@/app/lib/svgs";

import { SUCCESS, ERROR } from "@/app/lib/constants";

type PageCriticalDropdownProps = {
    pageId: string
    className?: string
}

export const PageCriticalDropdown = ({
    pageId,
    className="h-[2rem]"
}: PageCriticalDropdownProps) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const { isVisible, setIsVisible, ref} = useToggleVisibility();
    const { isVisible: isModalVisible, setIsVisible : setIsModalVisible, ref: modalRef} = useToggleVisibility();

    const { addToast } = useToastBundleContext();

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        try {
            const res = await deletePageASF(pageId);
            if (!res) {
                throw new Error("Something went wrong while deleting this page.");
            }

            addToast(makeToastOrder(SUCCESS.DELETE_PAGE_SUCCESS, true));
        } catch (error) {
            if (error instanceof Error &&
                'digest' in error &&
                typeof error.digest === 'string' &&
                error.digest.startsWith('NEXT_REDIRECT')) {
                addToast(makeToastOrder(SUCCESS.DELETE_PAGE_SUCCESS, true));
                return;
            }

            console.error(error);
            addToast(makeToastOrder(ERROR.DELETE_PAGE_SOMETHING_ERROR, false));
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={(e)=> {
                    e.stopPropagation();
                    setIsVisible((prev) => !prev)
                }}
                className="flex flex-row items-center h-full"
            >
                <CriticalSvg className="w-auto h-full aspect-auto p-[0.5rem]" />
                <ArrowDropdownSvg className='w-auto h-[15%] aspect-auto' />
            </button>

            {isVisible &&
            <div
                className='
                    absolute top-[110%] right-[0px] z-[10]
                    flex flex-col items-start
                    min-w-max bg-wh border-[0.1rem] border-supersub
                '
            >   
                <Link href={`/write?page_id=${pageId}`} className="px-[1rem] py-[0.5rem]">
                    write
                </Link>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsModalVisible(true)
                    }}
                    className="text-bad px-[1rem] py-[0.5rem]"
                >
                    delete
                </button>
            </div>}

            {isModalVisible && (
            <div className='fixed inset-0 p-[1rem] z-[50]'>
                <div
                    ref={modalRef}
                    className="
                        relative left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]
                        flex flex-col justify-center items-center bg-background w-full sm:w-[30rem] min-h-[20rem]
                        p-[2rem] rounded-[0.5rem] border-[0.1rem] border-powerbad
                    "
                >
                    <h3 className="text-[2rem] text-center font-[600] p-[0.5rem]">Confirm Delete</h3>

                    <p className="whitespace-pre-wrap text-center p-[0.5rem]">
                        Are you sure you want{'\n'}to delete this page?
                    </p>

                    <div className="flex flex-row gap-[1rem] p-[0.5rem]">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsModalVisible(false);
                            }}
                            className="
                                flex justify-center items-center w-[10rem] h-[3.5rem]
                                whitespace-nowrap p-[1rem] rounded-[0.5rem] border-[0.1rem]
                            "
                        >
                            No
                        </button>

                        <IngButton
                            type="button"
                            isIng={isDeleting}
                            isImm={true}
                            onClick={handleDelete}
                            className="
                                flex justify-center items-center w-[10rem] h-[3.5rem]
                                bg-bad text-background whitespace-nowrap p-[1rem] rounded-[0.5rem]
                            "
                        >
                            Delete
                        </IngButton>
                    </div>
                </div>
            </div>)}
        </div>
    );
}

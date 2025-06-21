"use client";

import { useState } from "react";
import { z } from "zod";

import { type InitBook, createBookASF, updateBookTitleASF } from "@/app/lib/SF/afterAuthSFs";
import { BookSchema } from '@/app/lib/tables';
import { useToastBundleContext, makeToastOrder } from '@/app/lib/context/ToastBundleContext';
import { TextInput } from "@/app/components/atomic/TextInput";
import { IngButton } from "@/app/components/atomic/IngButton";
import { BOOK, PLACEHOLDER } from '@/app/lib/constants';
import { SaveSvg } from "@/app/lib/svgs";

const CreateBookParamSchema = BookSchema.shape.book_title;
const UpdateBookTitleParamSchema = z.object({
  bookId: BookSchema.shape.book_id,
  bookTitle: BookSchema.shape.book_title
});

type BookTitleIEProps = {
    type: "create" | "update"
    initBook: InitBook
    onSubmitBookTitle: (initBook: InitBook) => void,
    className?: string
}

export const BookTitleIE = ({
    type,
    initBook,
    onSubmitBookTitle,
    className
}: BookTitleIEProps) => {
    const [bookTitle, setBookTitle] = useState<string>(initBook.book_title);
    const [isBookSubmitting, setIsBookSubmitting] = useState<boolean>(false);
    const { addToast } = useToastBundleContext();

    const handleSubmitBookTitle = type === "create"
    ? async () => {
        setIsBookSubmitting(true);

        try {
            const parsedBookTitle = CreateBookParamSchema.safeParse(bookTitle);
            if (!parsedBookTitle.success) {
                parsedBookTitle.error.errors.map(({message}) => addToast(makeToastOrder(message, false)));
                return;
            }

            const validNewBookTitle = parsedBookTitle.data;

            const res = await createBookASF(validNewBookTitle);
            if (!res.success) {
                res.errors.map(e => addToast(makeToastOrder(e, false)));
                return;
            }

            onSubmitBookTitle({
                book_id: res.bookId,
                book_title: validNewBookTitle
            });
            setBookTitle('');
            addToast(makeToastOrder(`You've created the new book ${validNewBookTitle} successfully.`, true));
        } catch (e) {
            console.error(e);
            addToast(makeToastOrder(`Something went wrong while creating a new book`, false));
        } finally {
            setIsBookSubmitting(false);
        }
    }
    : async () => {
        setIsBookSubmitting(true);

        try {
            const parsedBook = UpdateBookTitleParamSchema.safeParse({ bookId: initBook.book_id, bookTitle: bookTitle });
            if (!parsedBook.success) {
                parsedBook.error.errors.map(({message}) => addToast(makeToastOrder(message, false)));
                return;
            }

            const validBook = parsedBook.data;
            const { bookId: validBookId, bookTitle: validBookTitle }= parsedBook.data;

            const res = await updateBookTitleASF(validBook);
            if (!res.success) {
                res.errors.map(e => addToast(makeToastOrder(e, false)));
                return;
            }

            onSubmitBookTitle({
                book_id: validBookId,
                book_title: validBookTitle
            });
            addToast(makeToastOrder(`You've updated the new book ${validBookTitle} successfully.`, true));
        } catch (e) {
            console.error(e);
            addToast(makeToastOrder(`Something went wrong while updating the book`, false));
        } finally {
            setIsBookSubmitting(false);
        }
    }

    return (
        <div className={`flex flex-row items-center ${className}`}>
            <TextInput
                value={bookTitle}
                placeholder={PLACEHOLDER.BOOK_TITLE_PLACEHOLDER}
                maxLength={BOOK.BOOK_TITLE_MAX}
                onChange={(e) => setBookTitle(e.target.value)}
                className="flex-1 w-full"
            />
            <IngButton
                type="button"
                isIng={isBookSubmitting}
                isImm={false}
                onClick={handleSubmitBookTitle}
            >
                <SaveSvg className="w-auto h-[80%] aspect-auto" />
            </IngButton>
        </div>
    )
}
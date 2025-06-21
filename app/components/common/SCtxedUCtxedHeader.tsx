"use client";

import { useSCtxedUserContext } from '@/app/lib/context/SCtxedUserContext';
import { type HeaderProps, Header } from '@/app/components/common/Header';

export type SCtxedUCtxedHeaderProps = Omit<HeaderProps, 'userMenuProps'> & {
    userMenuClassName?: string
};

export const SCtxedUCtxedHeader = ({showSearch, authorId, className="h-[2rem]", userMenuClassName}: SCtxedUCtxedHeaderProps) => {
    const { user, isUserFirstLoading } = useSCtxedUserContext();

    return (
        <Header
            showSearch={showSearch}
            authorId={authorId}
            className={className}
            userMenuProps={{
                user: user,
                isUserFirstLoading: isUserFirstLoading,
                className: userMenuClassName
            }}
        />
    )
};
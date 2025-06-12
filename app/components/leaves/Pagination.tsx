"use client";

import Link from "next/link";
import { type ReadonlyURLSearchParams, usePathname, useSearchParams } from "next/navigation";

import { FirstLeftSvg, LeftSvg, RightSvg, LastRightSvg } from "@/app/lib/svgs";

import { SEARCH_PARAMS } from "@/app/lib/constants";

const PAGINATION_P_ARROW_CLASSNAME = 'w-auto h-full aspect-square p-[0.25rem] rounded-[0.25rem]';

type PaginationProps = {
    p: number,
    totalP: number | null,
    paginationPs: number[],
    className?: string
};

export const Pagination = ({
    p,
    totalP,
    paginationPs,
    className="h-[2rem]"
}: PaginationProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return (
        <div className={`flex flex-row items-center ${className}`}>
            <PaginationArrow
              direction="firstLeft"
              href={genPaginationURL({pathname: pathname, searchParams: searchParams, paginationP: 1})}
              isDisabled={p <= 1}
              className="h-full"
            />
            <PaginationArrow
              direction="left"
              href={genPaginationURL({pathname: pathname, searchParams: searchParams, paginationP: Math.min(p - 1, 1)})}
              isDisabled={p <= 1}
              className="h-full"
            />

            {paginationPs.map((paginationP) => {
              return <PaginationP
                key={paginationP}
                paginationP={paginationP}
                href={genPaginationURL({pathname: pathname, searchParams: searchParams, paginationP: paginationP})}
                isDisabled={p === paginationP}
                className="h-full"
            />})}

            <PaginationArrow
              direction="right"
              href={genPaginationURL({pathname: pathname, searchParams: searchParams, paginationP: Math.min(p + 1, totalP ?? p)})}
              isDisabled={p >= (totalP ?? p)}
              className="h-full"
            />
            <PaginationArrow
              direction="lastRight"
              href={genPaginationURL({pathname: pathname, searchParams: searchParams, paginationP: totalP ?? p})}
              isDisabled={p >= (totalP ?? p)}
              className="h-full"
            />
          </div>
    )
}

type PaginationSkeletonProps = {
  paginationPNum: number
  className?: string
};

export const PaginationSkeleton = ({
  paginationPNum,
  className="h-[2rem]"
}: PaginationSkeletonProps) => {
  return (
    <div className={`flex flex-row items-center ${className}`}>
      {Array.from({ length: paginationPNum }).map((_, idx) => {
        return (
          <div key={idx} className="h-full p-[0.25rem]">
            <div className='w-auto h-full aspect-square skeleton'></div>
          </div>
        )
      })}
    </div>
  )
};

type PaginationArrowParam = {
  direction: 'left' | 'right' | 'firstLeft' | 'lastRight';
  href: string;
  isDisabled: boolean;
  className?: string
};

const PaginationArrow = ({ direction, href, isDisabled, className="h-[2rem]" }: PaginationArrowParam) => {
  let icon = null;
  switch (direction) {
    case 'firstLeft':
      icon = <FirstLeftSvg className={PAGINATION_P_ARROW_CLASSNAME} />;
      break;
    case 'left':
      icon = <LeftSvg className={PAGINATION_P_ARROW_CLASSNAME} />;
      break;
    case 'right':
      icon = <RightSvg className={PAGINATION_P_ARROW_CLASSNAME} />;
      break;
    case 'lastRight':
      icon = <LastRightSvg className={PAGINATION_P_ARROW_CLASSNAME} />;
      break;
  }

  return isDisabled ? (
    <div className={`flex justify-center items-center ${className}`}>{icon}</div>
  ) : (
    <Link href={href} className={`flex justify-center items-center ${className}`}>{icon}</Link>
  );
};

type PaginationPParam = {
  paginationP: number;
  href: string;
  isDisabled: boolean;
  className?: string
};

const PaginationP = ({ paginationP, href, isDisabled,className="h-[2rem]" }: PaginationPParam) => {
  return isDisabled ? (
    <div className={`flex justify-center items-center bg-supersub ${PAGINATION_P_ARROW_CLASSNAME} ${className}`}>
      {paginationP}
    </div>
  ) : (
    <Link
      href={href}
      className={`flex justify-center items-center ${PAGINATION_P_ARROW_CLASSNAME} ${className}`}
    >
      {paginationP}
    </Link>
  );
}

type GenPaginationURLParam = {
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  paginationP: number
};

export const genPaginationURL = ({pathname, searchParams, paginationP} : GenPaginationURLParam) => {
  const params = new URLSearchParams(searchParams);
  params.set(SEARCH_PARAMS.P_PARAM, paginationP.toString());
  return `${pathname}?${params.toString()}`;
};
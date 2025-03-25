import {Search} from '@/app/components/Search'
import {InfiniteScrollSearchResults} from "@/app/components/InfiniteScrollSearchResults"
import {PaginationSearchResults} from "@/app/components/PaginationSearchResults"
import type { SearchedParamsType } from '@/app/lib/sqls'
import { getNaturalNumber, parseToken, parseString, parseDate, parseOrderCriteria } from '@/app/lib/utils'

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const sp = await searchParams;
  const p = getNaturalNumber(sp.p);
  const {searchedMode, searchedParams} = getSearchedState(sp);

  return(
    <div className='flex flex-col items-center gap-[1rem] container mt-[1rem]'>
      <Search searchedMode={searchedMode} p={p} searchedParams={searchedParams}/>
      {
      !searchedMode
      ? null
      : p
        ? <PaginationSearchResults p={p} searchedMode={searchedMode} searchedParams={searchedParams}/>
        : <InfiniteScrollSearchResults searchedMode={searchedMode} searchedParams={searchedParams}/>
      }
    </div>
  )
}
export default SearchPage;

export type SearchedModeType = "simple" | "detailed" | null;
export type SearchedStateType = {searchedMode: SearchedModeType, searchedParams:SearchedParamsType}
export const getSearchedState = (searchParams: {[key: string]: string | string[] | undefined}): SearchedStateType => {
  const user = parseToken(searchParams.user);
  const search = parseString(searchParams.search);
  const tag = parseToken(searchParams.tag);
  const createdAtFrom = parseDate(searchParams.created_at_from);
  const createdAtTo = parseDate(searchParams.created_at_to);
  const order = parseOrderCriteria(searchParams.order);

  const isDetailed = (user.length !== 0) || (tag.length !== 0) || createdAtFrom || createdAtTo;
  const isSimple = !isDetailed && !!search;
  const searchedParams = {user_ids:user, search: search, tag_ids:tag, created_at_from:createdAtFrom, created_at_to: createdAtTo, orderCritic: order}
  if (isDetailed) return { searchedMode: "detailed", searchedParams: searchedParams}
  if (isSimple) return {searchedMode: "simple", searchedParams: searchedParams};
  return {searchedMode: null, searchedParams: searchedParams};
}
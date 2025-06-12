import { type GetSlipsReq } from '@/app/lib/SFs/publicSFs';
import {
  type SearchParams,
  type OrderCritic,
  parseSPVNaturalNumber,
  parseSPVString,
  parseSPVToken,
  parseSPVDate,
  parseSPVOrderCritic
} from '@/app/lib/utils';
import { Search } from '@/app/components/common/Search';
import { InfiniteSlips } from "@/app/components/search/InfiniteSlips";
import { PaginationSlips } from "@/app/components/search/PaginationSlips";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const sp = await searchParams;
  const p = parseSPVNaturalNumber(sp.p);
  const [searchReq, orderCritic] = getSearchReqAndOrderCritic(sp);

  return(
    <div className='flex flex-col items-center gap-[3rem] w-full'>
      <Search p={p} searchReq={searchReq} orderCritic={orderCritic} showUserIdSearch={true} />

      {!searchReq
      ? null
      : p
         ? <PaginationSlips
            p={p}
            searchReq={searchReq}
            className='w-full'
            itemContainerClassName='divide-y-[0.1rem] divide-y-superdupersub'
          />
         : <InfiniteSlips
            searchReq={searchReq}
            className='w-full'
            itemContainerClassName='divide-y-[0.1rem] divide-y-superdupersub'
          />}
    </div>
  )
}
export default SearchPage;

const getSearchReqAndOrderCritic = (searchParams: SearchParams): [GetSlipsReq | null, OrderCritic] => {
  const search = parseSPVString(searchParams.search);
  const tagIds = parseSPVToken(searchParams.tag);
  const userIds = parseSPVToken(searchParams.user);
  const createdAtFrom = parseSPVDate(searchParams.created_at_from);
  const createdAtTo = parseSPVDate(searchParams.created_at_to);
  const orderCritic = parseSPVOrderCritic(searchParams.order);

  if ((tagIds.length !== 0) || (userIds.length !== 0) || createdAtFrom || createdAtTo) {
    return [{
      searchType: "detailed",
      search: search,
      tag_ids:tagIds,
      user_ids:userIds,
      created_at_from:createdAtFrom,
      created_at_to: createdAtTo,
      orderCritic: orderCritic
    }, orderCritic
  ]}

  if (search) {
    return [{
      searchType: "simple",
      search: search,
      orderCritic: orderCritic
    }, orderCritic
  ]}
  
  return [null, orderCritic];
};
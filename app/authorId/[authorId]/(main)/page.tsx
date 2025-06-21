import { getAutTagsSF, type GetSlipsAutReq } from "@/app/lib/SF/publicSFs";
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
import { InfiniteAutSlips } from "@/app/components/dynAuthorId/InfiniteAutSearchSlips";
import { PaginationAutSlips } from "@/app/components/dynAuthorId/PaginationAutSlips";

const AuthorIdDynamicPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ authorId: string }>
  searchParams: Promise<SearchParams>
}) => {
  const {authorId} = await params;
  const sp = await searchParams;

  const p = parseSPVNaturalNumber(sp.p);
  const [searchReq, orderCritic] = getAutSearchReqAndOrderCritic(authorId, sp);

  const { autTags } = await getAutTagsSF({authorId: authorId});

  return (
    <div className='flex flex-col items-center py-[1.5rem]'>
      <Search
        p={p}
        searchReq={searchReq}
        orderCritic={orderCritic}
        showUserIdSearch={false}
        givenTokens={autTags}
        className="py-[1.5rem]"
      />

      {p
      ? <PaginationAutSlips
        p={p}
        searchReq={searchReq}
        className='w-full py-[1.5rem]'
        itemsContainerClassName='divide-y-[0.1rem] divide-y-superdupersub'
        itemClassName="h-[17rem] py-[1rem]"
      />
      : <InfiniteAutSlips
        searchReq={searchReq}
        className='w-full py-[1.5rem]'
        itemsContainerClassName='divide-y-[0.1rem] divide-y-superdupersub'
        itemClassName="h-[17rem] py-[1rem]"
      />}
    </div>
  )
}
export default AuthorIdDynamicPage;

const getAutSearchReqAndOrderCritic = (authorId: string, searchParams: SearchParams): [GetSlipsAutReq, OrderCritic] => {
  const search = parseSPVString(searchParams.search);
  const tagIds = parseSPVToken(searchParams.tag);
  const createdAtFrom = parseSPVDate(searchParams.created_at_from);
  const createdAtTo = parseSPVDate(searchParams.created_at_to);
  const orderCritic = parseSPVOrderCritic(searchParams.order, "created_at");

  if ((tagIds.length !== 0) || createdAtFrom || createdAtTo) {
    return [{
      authorId: authorId,
      searchType: "detailed",
      search: search,
      tag_ids:tagIds,
      created_at_from: createdAtFrom,
      created_at_to: createdAtTo,
      orderCritic: orderCritic
    }, orderCritic
  ]}

  return [{
      authorId: authorId,
      searchType: "simple",
      search: search,
      orderCritic: orderCritic
    }, orderCritic
  ];
};
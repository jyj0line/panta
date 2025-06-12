import { type UsePaginationParam, usePagination } from "@/app/lib/hooks";
import { Pagination, PaginationSkeleton } from "@/app/components/leaves/Pagination";
import { type InfromDataStateProps } from "@/app/components/leaves/InformDataState";
import { SpinnerSvg } from "@/app/lib/svgs";

type PaginationItemsProps<TRequest extends Record<string, unknown>, TResponse, TAdditionalProps> = {
  getItems: UsePaginationParam<TRequest, TResponse>['getItems'],
  req: UsePaginationParam<TRequest, TResponse>["req"],
  p: UsePaginationParam<TRequest, TResponse>["p"],
  limit: UsePaginationParam<TRequest, TResponse>["limit"],
  paginationPsLen: UsePaginationParam<TRequest, TResponse>["paginationPsLen"],

  isDefaultReq?: boolean;

  renderItem: (item: TResponse, additionalProps: TAdditionalProps) => React.ReactNode,
  additionalProps: TAdditionalProps,

  LoadingComponent: React.ComponentType<{ limit: number, className?: string }>,
  EmptyComponent: React.ComponentType<InfromDataStateProps>,
  ErrorComponent: React.ComponentType<InfromDataStateProps>,
  DefaultEmptyComponent?: React.ComponentType<InfromDataStateProps>,

  loadingProps: { limit: number, showAuthorInfo?: boolean, className?: string },
  emptyProps: InfromDataStateProps,
  errorProps: InfromDataStateProps,
  defaultEmptyProps?: InfromDataStateProps,

  className?: string,
  itemContainerClassName?: string,
}

export const PaginationItems = <TRequest extends Record<string, unknown>, TResponse, TAdditionalProps>({
  getItems, req, p, limit, paginationPsLen: paginationPsLen,
  isDefaultReq,
  renderItem, additionalProps,
  LoadingComponent, EmptyComponent, ErrorComponent, DefaultEmptyComponent,
  loadingProps, emptyProps, errorProps, defaultEmptyProps={ heading:'', para: '' },
  className, itemContainerClassName
}: PaginationItemsProps<TRequest, TResponse, TAdditionalProps>) => {
  
  const { 
    items, totalCount, 
    totalP, paginationPs,
    isLoading, isNewLoading, isError 
  } = usePagination<TRequest, TResponse>({ getItems, req, p, limit, paginationPsLen: paginationPsLen });

  return (
    <div className={`flex flex-col ${className}`}>
      <div className='flex flex-row justify-between items-center h-[2rem]'>
        <div className='flex flex-row items-center h-full'>
          <p className="whitespace-pre">
            {`total `} 
          </p>

          <p
            className={`
              flex justify-center items-center h-[70%]
              ${isNewLoading ? 'w-[4rem] skeleton' : 'w-fit'
              }
            `}
          >
            {totalCount}
          </p>
        </div>

        {(isLoading && !isNewLoading)
        && <SpinnerSvg className="self-center w-auto h-[1.5rem] aspect-auto animate-spin" />}
      </div>

      <div className={itemContainerClassName}>
        {items.map((item) => {
          return renderItem(item, additionalProps);
        })}
      </div>
      
      {isNewLoading && <LoadingComponent {...loadingProps} />}
      
      {(!isDefaultReq && !isLoading && !isError && items.length === 0)
      && <EmptyComponent {...emptyProps}/>}
      {(isDefaultReq && !isLoading && !isError && items.length === 0 && DefaultEmptyComponent)
      && <DefaultEmptyComponent {...defaultEmptyProps} />}
      {(!isLoading && isError)
      && <ErrorComponent {...errorProps}/>}

      {isNewLoading
      ? <PaginationSkeleton paginationPNum={paginationPsLen} className='self-center h-[2rem]'/>
      : paginationPs.length > 0
        ? <Pagination p={p} totalP={totalP} paginationPs={paginationPs} className='self-center h-[2rem]'/>
        : null
      }
    </div>
  );
};
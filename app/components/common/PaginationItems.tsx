import { type ClassNamesProps } from "@/app/lib/utils";
import { type UsePaginationParam, usePagination } from "@/app/lib/hooks";
import { Pagination, PaginationSkeleton } from "@/app/components/atomic/Pagination";
import { type InfromDataStateProps } from "@/app/components/atomic/InformDataState";
import { SpinnerSvg } from "@/app/lib/svgs";

type PaginationItemsProps<TRequest extends Record<string, unknown>, TResponse, TAdditionalProps, TLoadingProps extends Record<string, unknown>> = {
  getItems: UsePaginationParam<TRequest, TResponse>['getItems'],
  req: UsePaginationParam<TRequest, TResponse>["req"],
  p: UsePaginationParam<TRequest, TResponse>["p"],
  limit: UsePaginationParam<TRequest, TResponse>["limit"],
  paginationPsLen: UsePaginationParam<TRequest, TResponse>["paginationPsLen"],

  isDefaultReq?: boolean;
  showTotal?: boolean;
  loadingLimit?: number

  renderItem: (item: TResponse, additionalProps: TAdditionalProps, className?: string) => React.ReactNode,
  additionalItemProps: TAdditionalProps,

  LoadingComponent: React.ComponentType<TLoadingProps>,
  EmptyComponent: React.ComponentType<InfromDataStateProps>,
  ErrorComponent: React.ComponentType<InfromDataStateProps>,
  DefaultEmptyComponent?: React.ComponentType<InfromDataStateProps>,

  loadingProps: TLoadingProps,
  emptyProps: InfromDataStateProps,
  errorProps: InfromDataStateProps,
  defaultEmptyProps?: InfromDataStateProps
} & ClassNamesProps;

export const PaginationItems = <TRequest extends Record<string, unknown>, TResponse, TAdditionalProps extends Record<string, unknown>, TLoadingProps extends Record<string, unknown>>({
  getItems, req, p, limit, paginationPsLen: paginationPsLen,
  showTotal=true, isDefaultReq=false, loadingLimit,
  renderItem, additionalItemProps,
  LoadingComponent, EmptyComponent, ErrorComponent, DefaultEmptyComponent,
  loadingProps, emptyProps, errorProps, defaultEmptyProps={ heading:'', para: '' },
  className, itemsContainerClassName, itemClassName
}: PaginationItemsProps<TRequest, TResponse, TAdditionalProps, TLoadingProps>) => {
  
  const { 
    items, totalCount, totalP, paginationPs,
    isLoading, isNewLoading, isError 
  } = usePagination<TRequest, TResponse>({ getItems, req, p, limit, paginationPsLen: paginationPsLen });

  return (
    <div className={`flex flex-col ${className}`}>
      {showTotal &&
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
      </div>}

      <div className={itemsContainerClassName}>
        {items.map((item) => {
          return renderItem(item, additionalItemProps, itemClassName);
        })}
        
        {isLoading && Array.from({ length: loadingLimit ?? limit }).map((_, idx) => 
          <LoadingComponent key={idx} {...loadingProps} className={`${loadingProps?.className ?? ''} ${itemClassName}`} />
        )}
      </div>
      
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
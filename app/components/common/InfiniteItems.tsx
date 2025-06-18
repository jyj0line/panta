import { type ClassNamesProps } from "@/app/lib/utils";
import { type UseInfiniteScrollProps, useInfiniteScroll, useIntersectionObserver } from "@/app/lib/hooks";
import { type InfromDataStateProps } from "@/app/components/leaves/InformDataState";

type InfiniteItemsProps<TRequest extends Record<string, unknown>, TResponse, TAdditionalProps extends Record<string, unknown>, TLoadingProps extends Record<string, unknown>> = {
  getItems: UseInfiniteScrollProps<TRequest, TResponse>['getItems'],
  req: UseInfiniteScrollProps<TRequest, TResponse>["req"],
  limit: UseInfiniteScrollProps<TRequest, TResponse>["limit"],

  isDefaultReq?: boolean;
  showTotal?: boolean;
  totalLimit?: number
  loadingLimit?: number

  renderItem: (item: TResponse, additionalProps: TAdditionalProps, className?: string) => React.ReactNode,
  additionalItemProps: TAdditionalProps,

  LoadingComponent: React.ComponentType<TLoadingProps>,
  EmptyComponent: React.ComponentType<InfromDataStateProps>,
  ErrorComponent: React.ComponentType<InfromDataStateProps>,
  EndComponent: React.ComponentType<InfromDataStateProps>,
  DefaultEmptyComponent?: React.ComponentType<InfromDataStateProps>,

  loadingProps: TLoadingProps,
  emptyProps: InfromDataStateProps,
  errorProps: InfromDataStateProps,
  endProps: InfromDataStateProps,
  defaultEmptyProps?: InfromDataStateProps
} & ClassNamesProps;

export const InfiniteItems = <TRequest extends Record<string, unknown>, TResponse, TAdditionalProps extends Record<string, unknown>, TLoadingProps extends Record<string, unknown>>({
  getItems, req, limit,
  showTotal=true, totalLimit, isDefaultReq=false, loadingLimit,
  renderItem, additionalItemProps,
  LoadingComponent, EmptyComponent, ErrorComponent, EndComponent, DefaultEmptyComponent,
  loadingProps, emptyProps, errorProps, endProps, defaultEmptyProps={ heading:'', para: '' },
  className, itemsContainerClassName, itemClassName
}: InfiniteItemsProps<TRequest, TResponse, TAdditionalProps, TLoadingProps>) => {
  
  const { 
    items, hasNextChunk, totalCount, 
    isLoading, isNewLoading, isError, loadMore 
  } = useInfiniteScroll<TRequest, TResponse>({ getItems, req, limit });

  const enabledByTotal = totalLimit === undefined || (totalCount !== undefined && hasNextChunk);

  const targetRef = useIntersectionObserver({
    root: null,
    rootMargin: '10%',
    threshold: 0.1,
    onIntersect: loadMore,
    enabled: !isLoading && hasNextChunk && enabledByTotal
  });

  return (
    <div className={`flex flex-col ${className}`}>
      {showTotal &&
      <div className='flex flex-row items-center h-[2rem]'>
        <p className="whitespace-pre">
          {`total `} 
        </p>

        <p
          className={`
            flex justify-center items-center h-[70%]
            ${isNewLoading ? 'w-[4rem] skeleton' : 'w-fit'}
          `}
        >
          {totalCount}
        </p>
      </div>}

      <div className={itemsContainerClassName}>
        {items.map((item) => {
          return renderItem(item, additionalItemProps, itemClassName);
        })}
        
        {isLoading && Array.from({ length: loadingLimit ?? limit }).map((_, idx) => 
          <LoadingComponent key={idx} {...loadingProps} className={`${loadingProps?.className ?? ''} ${itemClassName}`} />
        )}
      </div>

      <div ref={targetRef}></div>
      
      {(!isDefaultReq && !isLoading && !isError && items.length === 0)
      && <EmptyComponent {...emptyProps}/>}
      {(isDefaultReq && !isLoading && !isError && items.length === 0 && DefaultEmptyComponent)
      && <DefaultEmptyComponent {...defaultEmptyProps} />}
      {(!isLoading && isError)
      && <ErrorComponent {...errorProps}/>}
      {(!isLoading && !isError && items.length > 0 && !hasNextChunk)
      && <EndComponent {...endProps}/>}
    </div>
  );
};
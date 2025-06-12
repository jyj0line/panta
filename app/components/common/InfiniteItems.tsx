import { type UseInfiniteScrollProps, useInfiniteScroll, useIntersectionObserver } from "@/app/lib/hooks";
import { type InfromDataStateProps } from "@/app/components/leaves/InformDataState";

type InfiniteItemsProps<TRequest extends Record<string, unknown>, TResponse, TAdditionalProps> = {
  getItems: UseInfiniteScrollProps<TRequest, TResponse>['getItems'],
  req: UseInfiniteScrollProps<TRequest, TResponse>["req"],
  limit: UseInfiniteScrollProps<TRequest, TResponse>["limit"],

  isDefaultReq?: boolean;

  renderItem: (item: TResponse, additionalProps: TAdditionalProps) => React.ReactNode,
  additionalProps: TAdditionalProps,

  LoadingComponent: React.ComponentType<{ limit: number, className?: string }>,
  EmptyComponent: React.ComponentType<InfromDataStateProps>,
  ErrorComponent: React.ComponentType<InfromDataStateProps>,
  EndComponent: React.ComponentType<InfromDataStateProps>,
  DefaultEmptyComponent?: React.ComponentType<InfromDataStateProps>,

  loadingProps: { limit: number, showAuthorInfo?: boolean, className?: string },
  emptyProps: InfromDataStateProps,
  errorProps: InfromDataStateProps,
  endProps: InfromDataStateProps,
  defaultEmptyProps?: InfromDataStateProps,

  className?: string,
  itemContainerClassName?: string,
}

export const InfiniteItems = <TRequest extends Record<string, unknown>, TResponse, TAdditionalProps>({
  getItems, req, limit,
  isDefaultReq,
  renderItem, additionalProps,
  LoadingComponent, EmptyComponent, ErrorComponent, EndComponent, DefaultEmptyComponent,
  loadingProps, emptyProps, errorProps, endProps, defaultEmptyProps={ heading:'', para: '' },
  className, itemContainerClassName
}: InfiniteItemsProps<TRequest, TResponse, TAdditionalProps>) => {
  
  const { 
    items, hasNextChunk, totalCount, 
    isLoading, isNewLoading, isError, loadMore 
  } = useInfiniteScroll<TRequest, TResponse>({ getItems, req, limit });

  const targetRef = useIntersectionObserver({
    root: null,
    rootMargin: '10%',
    threshold: 0.1,
    onIntersect: loadMore,
    enabled: !isLoading && hasNextChunk,
  });

  return (
    <div className={`flex flex-col ${className}`}>
      <div className='flex flex-row items-center h-[2rem]'>
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

      <div className={itemContainerClassName}>
        {items.map((item) => {
          return renderItem(item, additionalProps);
        })}
      </div>
      
      {isLoading && <LoadingComponent {...loadingProps} />}
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
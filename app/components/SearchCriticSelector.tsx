'use client'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

import { useToggleVisibility } from '@/app/lib/hooks'
import { OrderCriteriaType } from '@/app/lib/sqls'
import { ArrowDropdownSvg } from '@/app/lib/svgs'

const orderCriteria: OrderCriteriaType[] = [
  "rank", "created_at"
];

type SearchOrderSelectorProps = {
    currentOrderCritic: OrderCriteriaType;
}
export const SearchCriticSelector = ({currentOrderCritic: currentCritic}: SearchOrderSelectorProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();
  
  const { isVisible, setIsVisible, ref } = useToggleVisibility();

  const handleOrderChange = (critic: OrderCriteriaType) => {
    const params = new URLSearchParams(searchParams);
    
    if (orderCriteria.includes(critic)) {
      params.set('order', critic);
    } else {
      params.delete('order');
    }
    
    push(`${pathname}?${params.toString()}`);
    setIsVisible(false)
  };
  
  return (
    <div ref={ref} className='relative flex flex-col justify-center items-end w-[8rem]'>
      <div onClick={() => setIsVisible(prev => !prev)} className='flex flex-row justify-center items-center cursor-pointer'>
        <span className='text-[1rem]'>{currentCritic}</span>
        <ArrowDropdownSvg className='w-[2rem] h-[2rem]'/>
      </div>

      {isVisible && (
        <div className='flex flex-col justify-center absolute min-w-max w-[8rem] right-0 top-full shadow-lg bg-background'>
          {orderCriteria.map((critic) => (
            <div 
              key={critic} 
              onClick={() => handleOrderChange(critic)}
              className={`px-[1rem] py-[0.5rem] text-[1rem] cursor-pointer ${critic === currentCritic ? 'text-em' : ''} hover:bg-supersub `}
            >
              {critic}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
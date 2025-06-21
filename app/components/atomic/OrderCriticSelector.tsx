'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';

import { ORDER_CRITERIA, type OrderCritic } from '@/app/lib/utils';
import { useToggleVisibility } from '@/app/lib/hooks';
import { ArrowDropdownSvg } from '@/app/lib/svgs';

type OrderCriticSelectorProps = {
    currentOrderCritic: OrderCritic,
    className?: string
};

export const OrderCriticSelector = ({ currentOrderCritic, className="h-[3rem]" }: OrderCriticSelectorProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();
  
  const { isVisible, setIsVisible, ref } = useToggleVisibility();

  const handleOrderCriticChange = (orderCritic: OrderCritic) => {
    const params = new URLSearchParams(searchParams);
    params.set('order', orderCritic);
    push(`${pathname}?${params.toString()}`);

    setIsVisible(false);
  };
  
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsVisible(prev => !prev)}
        className='flex flex-row items-center gap-[0.3rem] h-full'>
        <div>{currentOrderCritic}</div>
        <ArrowDropdownSvg className='w-auto h-[15%] aspect-auto'/>
      </button>

      {isVisible && (
      <div
        className='
          absolute top-[100%] right-[0px] z-[10]
          flex flex-col items-end
          min-w-max bg-wh border-[0.1rem] border-supersub
        '
      >
        {ORDER_CRITERIA.map((orderCritic) => (
          <button 
            key={orderCritic}
            type="button"
            onClick={() => handleOrderCriticChange(orderCritic)}
            className={`
              w-full text-right px-[1rem] py-[0.5rem]
              ${orderCritic === currentOrderCritic ? 'text-em' : ''} hover:bg-supersub
            `}
          >
            {orderCritic}
          </button>
        ))}
      </div>)}
    </div>
  )
}
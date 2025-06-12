"use client";

import { useToggleVisibility } from '@/app/lib/hooks';
import { IngButton } from '@/app/components/leaves/IngButton';
import { SaveSvg, CloseSvg } from '@/app/lib/svgs';

type WriteFormButtonsProps = {
  isSubmitting: boolean;
  onSubmit: () => void;
  onExit: () => void;
  className?: string
}
export const WriteFormButtons = ({
  isSubmitting,
  onSubmit,
  onExit,
  className="h-full"
}: WriteFormButtonsProps) => {
  const { isVisible, setIsVisible, ref } = useToggleVisibility();

  const handleExitDialogToggle = (): void => {
    setIsVisible(prev => !prev);
  };
  const handleExitDialogClose = (): void => {
    setIsVisible(false);
  };

  return (
      <div className={`relative flex flex-row items-center ${className}`}>
        <IngButton
          isIng={isSubmitting}
          type="button"
          onClick={onSubmit}
          isImm={true}
          className='flex justify-center items-center w-auto h-full aspect-square'
        >
          <SaveSvg className={`w-auto h-[60%] aspect-sqaure ${isSubmitting ? "opacity-[0]" : 'opacity-[1]'}`}/>
        </IngButton>

        <button
          type="button"
          onClick={handleExitDialogToggle}
          className='flex justify-center items-center w-auto h-full aspect-square'
        >
          <CloseSvg className="w-auto h-[40%] aspect-sqaure stroke-[10]"/>
        </button>

        {isVisible && (
        <div className='fixed inset-0 z-[50]'>
          <div
            ref={ref}
            className="
              relative left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]
              flex flex-col justify-center items-center bg-background w-full sm:w-[30rem] h-[20rem]
              p-[2rem] rounded-[0.5rem] border-[0.1rem] border-supersub
            "
          >
            <h3 className="text-[2rem] text-center font-[600] p-[0.5rem]">Confirm Exit</h3>

            <p className="whitespace-nowrap p-[0.5rem]">Are you sure you want to exit?</p>

            <div className="flex flex-row gap-[1rem] p-[0.5rem]">
              <button
                type="button"
                onClick={handleExitDialogClose}
                className="
                  flex justify-center items-center
                  w-[10rem] h-[3.5rem] whitespace-nowrap p-[1rem] rounded-[0.5rem] border-[0.1rem]
                "
              >
                Continue Writing
              </button>
              <button
                type="button"
                onClick={onExit}
                className="
                  flex justify-center items-center
                  w-[10rem] h-[3.5rem] bg-supersub whitespace-nowrap p-[1rem] rounded-[0.5rem]
                "
              >
                Exit
              </button>
            </div>
          </div>
        </div>)}
      </div>
  );
}
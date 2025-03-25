import { useToggleVisibility } from '@/app/lib/hooks'
import { SaveSvg, CloseSvg, SpinnerSvg } from '@/app/lib/svgs';

type WriteFormButtonsProps = {
  isPending: boolean;
  success?: boolean;
  message?: string;
  onSubmit: () => void;
  onExit: () => void;
}
export const WriteFormButtons = ({ isPending, success, message, onSubmit, onExit }: WriteFormButtonsProps) => {
  const { isVisible, setIsVisible, ref } = useToggleVisibility();
  const handleExitDialogOpen = (): void => {
    setIsVisible(prev => !prev);
  };
  const handleExitDialogClose = (): void => {
    setIsVisible(false);
  };

  return (
    <div className='relative'>
      <div className="flex flex-row items-center gap-[0.5rem]">
        <button 
          type="button" 
          className={`${isPending ?  'pointer-events-none': ''}`}
          onClick={onSubmit}
        >
          {isPending ? <SpinnerSvg className="w-[1.5rem] h-[1.5rem] animate-spin" /> : <SaveSvg className={`w-[1.5rem] h-[1.5rem] ${success ? 'animate-success' : ''}`}/>}
        </button>
        <div ref={ref} className='relative flex justify-center items-center'>
          <button
            type="button"
            onClick={handleExitDialogOpen}
          >
            <CloseSvg className="w-[1.5rem] h-[1.5rem]"/>
          </button>
          {isVisible && (
          <div className="flex flex-col justify-center items-center absolute top-[100%] right-[0px] px-[2rem] py-[1.5rem] rounded-[0.5rem] m-[1rem] bg-background shadow-lg">
            <h3 className="text-[2rem] font-[600] p-[0.5rem]">Confirm Exit</h3>
            <p className="whitespace-nowrap p-[0.5rem]">Are you sure you want to exit?</p>
            <div className="flex flex-row justify-center items-center gap-[1rem] p-[0.5rem]">
              <button
                type="button"
                onClick={handleExitDialogClose}
                className="p-[1rem] whitespace-nowrap rounded-md border-[0.1rem]"
              >
                Continue Writing
              </button>
              <button
                type="button"
                onClick={onExit}
                className="relative flex p-[1rem] whitespace-nowrap rounded-md bg-supersub"
              >
                <div className='absolute inset-x-0'>Exit</div>
                <div className='invisible'>Continue Writing</div>
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
      {(isPending === false && success === true) && <div className="absolute top-[100%] right-[0px] whitespace-nowrap px-[2rem] py-[1.5rem] rounded-[0.5rem] text-background m-[1rem] bg-em animate-message">{message}</div>}
      {(isPending === false && success === false) && <div className="absolute top-[100%] right-[0px] whitespace-nowrap px-[2rem] py-[1.5rem] rounded-[0.5rem] text-background m-[1rem] bg-bad animate-message">{message}</div>}
    </div>
  );
}
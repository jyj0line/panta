import Link from "next/link";

import { PrefixedMessage } from "@/app/components/leaves/PrefixedMessage";

type SuccessScreenProps = {
  callbackUrl: string;
  successMessage: string;
  afterMessages: string[],
  className?: string
}
export const SuccessScreen = ({
  callbackUrl,
  successMessage: successMessage,
  afterMessages,
  className="min-h-full"
}: SuccessScreenProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-[2rem] p-[3rem] ${className}`}>
        <h1 className="text-center text-[2rem] font-[500]">{successMessage}</h1>
        
        <div className='flex flex-col items-center gap-[0.1rem]'>
            {afterMessages.length !== 0 &&
            <p className='text-[1.25rem] fon-[500]'>But...</p>}
            <PrefixedMessage
            name="sign_up_success"
            messages={afterMessages}
            prefix='- '
            className='gap-[0.1rem]'
            />
        </div>
        
        <Link href={callbackUrl} className="bg-supersub p-[1rem] rounded-[0.5rem]">
            Go to the Panta Page
        </Link>
    </div>
  );
}
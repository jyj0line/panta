import { SpinnerSvg } from "@/app/lib/svgs";

type IngButtonProps = {
    isIng: boolean;
    type: "button" | "submit"
    onClick: () => void;
    children: React.ReactNode;
    isImm?: boolean
    id?: string;
    className?: string;
}
export const IngButton = ({
    isIng,
    type,
    onClick,
    children,
    isImm=false,
    id,
    className="h-[2rem]"
}: IngButtonProps) => {
    return (
        <button
            id={id}
            type={type}
            disabled={isIng}
            aria-disabled={isIng}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
                relative rounded-[0.5rem]
                ${isIng
                    ? `pointer-events-none
                        ${isImm
                            ? 'animate-text-transparent-loading-imm'
                            : 'animate-text-transparent-loading'
                        }`
                    : ''
                }
                ${className}
            `}
        >
            {children}
            {isIng
            && <SpinnerSvg
                className={`
                    absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]
                    w-auto h-[60%] aspect-square opacity-[0]
                    ${isImm
                        ? 'animate-spin-centered-imm'
                        : 'animate-spin-centered'
                    }
                `}
            />}
        </button>
    );
};

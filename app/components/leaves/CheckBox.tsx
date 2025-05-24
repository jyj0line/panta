import { CheckBoxOnSvg, CheckBoxOffSvg } from "@/app/lib/svgs";

type CheckBoxProps = {
    label: string;
    isOn: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void
    className?: string;
    uncheckedErrClassName?: string;
}
export const CheckBox = ({
    label,
    isOn,
    onClick,
    onBlur,
    className="h-[1.5rem]",
    uncheckedErrClassName
}: CheckBoxProps) => {
    return (
        <button
            type="button"
            tabIndex={onBlur ? 0 : undefined}
            onClick={onClick}
            onBlur={onBlur}
            className={`flex flex-row items-center gap-[0.1rem] ${className}`}
        >
            {isOn ?
            <CheckBoxOnSvg className='w-auto h-full aspect-square' /> :
            <CheckBoxOffSvg className={`w-auto h-full aspect-square ${uncheckedErrClassName}`} />}
            <span>{label}</span>
        </button>
    )
};
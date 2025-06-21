import { useToggleVisibility } from '@/app/lib/hooks';
import { ArrowDropdownSvg, ArrowDropupSvg } from '@/app/lib/svgs';

type SelectInputOptions = {
    id: string;
    title: string;
}

type SelectInputProps = {
    name: string
    options: SelectInputOptions[]
    selectedOptionId: string
    blankTitle: string;
    onChange: React.Dispatch<React.SetStateAction<string>>
    className?: string
}

export const SelectInput = ({
    name,
    options,
    selectedOptionId,
    blankTitle,
    onChange,
    className="h-full"
}: SelectInputProps) => {
    const { isVisible, setIsVisible, ref } = useToggleVisibility();
  
    return(
        <div
            ref={ref}
            onClick={() => setIsVisible(prev => !prev)}
            className={`relative w-full cursor-pointer ${className}`}
        >
            <div className='flex flex-row justify-between items-center h-full'>
                <input type="hidden" name={name} value={selectedOptionId || ''}></input>
                <div className='flex-1 truncate'>
                    {options.find(opt => opt.id === selectedOptionId)?.title ?? blankTitle}
                </div>
                {isVisible ?
                <ArrowDropupSvg className='w-auto h-[20%] aspect-[2/1]' />:
                <ArrowDropdownSvg className='w-auto h-[20%] aspect-[2/1]' />}
            </div>

            {isVisible &&
            <ul
                className='
                    absolute left-[0px] top-[100%] flex flex-col
                    w-full max-h-[25rem] bg-wh border-[0.1rem] border-supersub
                    overflow-y-auto hide_scrollbar
                '
            >
                <li
                    onClick={() => onChange('')}
                    className={`
                        flex flex-row items-center truncate
                        ${className} ${selectedOptionId === '' ? 'bg-supersub' : ''}
                    `}
                >
                    {blankTitle}
                </li>
                {options.map((opt) => (
                <li
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                    className={`
                        flex flex-row items-center truncate
                        ${className} ${selectedOptionId === opt.id ? 'bg-supersub' : ''}
                    `}
                >
                    {opt.title}
                </li>
                ))}
            </ul>}
        </div>
    )
}
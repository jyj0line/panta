type DateInputProps = {
    id?: string
    date: string | null
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
}
export const DateInput = ({
    id,
    date,
    onChange,
    className
}: DateInputProps) => {
    return (
        <input
            id={id}
            type="date"
            value={date ?? ''}
            onChange={onChange}
            className={className}
        />
    )
}
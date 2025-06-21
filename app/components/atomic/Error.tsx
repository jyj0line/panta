type ErrorProps = {
  reset: () => void
}

export const Error = ({ reset }: ErrorProps) => {
  return (
    <main className="flex flex-col justify-center items-center min-h-dvh">
      <h2 className="p-[1rem]">
        Something went wrong!
      </h2>
      <button
        type="button"
        onClick={() => reset()}
        className="px-[1.5rem] py-[1rem] rounded-[0.5rem] text-background bg-em"
      >
        Try again
      </button>
    </main>
  );
};
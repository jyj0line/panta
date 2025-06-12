import { DefaultEmptySvg, EmptySvg, EndSvg, ErrorSvg } from '@/app/lib/svgs'

const CONTAINER = "flex flex-col items-center gap-[1rem] p-[2rem]";
const SVG= "w-auto h-[3rem] aspect-auto";
const HEADING = "text-[1.5rem] font-[500]";
const P = "text-[1.2rem] text-sub";

export type InfromDataStateProps ={
  heading: string,
  para: string;
}

export const DefaultEmpty = ({
  heading,
  para
}: InfromDataStateProps) => {
  return(
    <div className={CONTAINER}>
        <DefaultEmptySvg className={SVG} />
        <h3 className={HEADING}>{heading}</h3>
        <p className={P}>{para}</p>
    </div>
  );
}

export const Empty = ({
  heading,
  para
}: InfromDataStateProps) => {
  return(
    <div className={CONTAINER}>
        <EmptySvg className={SVG} />
        <h3 className={HEADING}>{heading}</h3>
        <p className={P}>{para}</p>
    </div>
  );
}

export const End = ({
  heading,
  para
}: InfromDataStateProps) => {
  return(
    <div className={CONTAINER}>
        <EndSvg className={SVG}/>
        <h3 className={HEADING}>{heading}</h3>
        <p className={P}>{para}</p>
    </div>
  )
}

export const Error = ({
  heading,
  para
}: InfromDataStateProps) => {
  return(
    <div className={CONTAINER}>
        <ErrorSvg className={SVG}/>
        <h3 className={HEADING}>{heading}</h3>
        <p className={P}>{para}</p>
    </div>
  )
}
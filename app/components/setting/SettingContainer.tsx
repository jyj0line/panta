import Link from 'next/link';

import { RightSvg  } from '@/app/lib/svgs';

type SettingContainerType = 'plain' | 'critical';
type SettingContainerStyles = {
    container: string;
    heading: string;
    link: string
};
export type LinkItem = {
    href: string
    description: string
}
type SettingContainerProps = {
    type: SettingContainerType
    heading: string;
    linkItems: LinkItem[] 
}
const typeStyles: Record<SettingContainerType, SettingContainerStyles> = {
  plain: {
    container: 'bg-wh border-supersub',
    heading: 'border-b-supersub',
    link: 'hover:bg-powerbackground',
  },
  critical: {
    container: 'bg-superduperbad border-superbad',
    heading: 'border-b-superbad',
    link: 'hover:bg-superbad',
  },
};
export const SettingContainer = ({type, heading, linkItems}: SettingContainerProps) => {
    const styles = typeStyles[type];
    
    return (
        <div
            className={`
                flex flex-col rounded-[0.5rem] w-full sm:w-[80%]
                border-[0.1rem] ${styles.container}`
            }>
            <h2
                className={`text-[1.2rem] p-[1rem] border-b-[0.1rem] font-[500] ${styles.heading}`}
            >
                {heading}
            </h2>
            {linkItems.map(({href, description}) => {
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-row items-center p-[0.5rem] ${styles.link}`}
                    >
                        <RightSvg className="w-[2rem] h-[2rem]" />
                        {description}
                    </Link>
                );
            })}
        </div>
    );
}
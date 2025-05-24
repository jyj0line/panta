import Link from 'next/link';

type Breadcrumb = {
  label: string;
  href: string;
  active: boolean;
  abled: boolean;
}
type BreadcrumbsProps = {
  breadcrumbs: Breadcrumb[]
}
export const Breadcrumbs= ({breadcrumbs}: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="p-[1rem] hide_scrollbar">
      <ol className='flex flex-row items-center'>
        {breadcrumbs.map((breadcrumb, index) => (
        <li
          key={breadcrumb.href}
          aria-current={breadcrumb.active}
          className={`${breadcrumb.active ? '' : 'text-sub'}`}
        >
          {breadcrumb.abled ? (
          <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
          ) : (
          <span>{breadcrumb.label}</span>
          )}
          {index < breadcrumbs.length - 1 ? (
          <span >/</span>
          ) : null}
        </li>
        ))}
      </ol>
    </nav>
  );
}
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPageTitleSF } from "@/app/lib/SFs/publicSFs";

import { METADATA } from '@/app/lib/constants';

type generateMetadataParam = {
  params: Promise<{ pageId: string }>
}

export const generateMetadata = async (
  { params }: generateMetadataParam
): Promise<Metadata> => {
  const { pageId } = await params;
  const pageTitle = await getPageTitleSF(pageId);

  if (pageTitle === null) {
    return {
      title: {
        template: '%s | Panta',
        default: METADATA.NOT_FOUND_TITLE_METADATA
      }
    }
  }

  return {
    title: {
      template: '%s | Panta',
      default: pageTitle
    }
  }
};

const DynPageIdLayout = async ({
  params,
  children
}: {
  params: Promise<{ pageId: string }>
  children: React.ReactNode
}) => {
  const { pageId } = await params;
  const pageTitle = await getPageTitleSF(pageId);

  if (pageTitle === null) notFound();

  return(
    [children]
  );
}
export default DynPageIdLayout;
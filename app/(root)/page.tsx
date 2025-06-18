import { InfiniteTreSlips } from "@/app/components/groRoot/InfiniteTreSlips";

const GroRootPage = () => {
  return (
    <InfiniteTreSlips
      className="bg-superbackground container p-[2rem]"
      itemsContainerClassName="grid grid-cols-slips-grid gap-[2rem]"
      itemClassName="bg-wh w-full h-auto aspect-[1/1] p-[1rem] shadow-lg"
    />
  );
}
export default GroRootPage;
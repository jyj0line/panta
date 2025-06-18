import { getAuthenticatedUserASF } from "@/app/lib/SFs/afterAuthSFs";
import { NotLoggedIn } from "@/app/components/groRoot/NotLoggedIn";
import { InfiniteSubSlips } from "@/app/components/groRoot/InfiniteSubSlips";

const GroRooSubscribingPage = async () => {
  const reader = await getAuthenticatedUserASF();
  if (!reader) {
    return (
      <NotLoggedIn
        heading="Not Logged In"
        paragraph="Please sign up or login."
        className="flex-1 justify-center items-center gap-[2rem]"
      />
    )
  }

  return (
    <InfiniteSubSlips
      className="bg-superbackground container p-[2rem]"
      itemsContainerClassName="grid grid-cols-slips-grid gap-[2rem]"
      itemClassName="bg-wh w-full h-auto aspect-[1/1] p-[1rem] shadow-lg"
    />
  );
}
export default GroRooSubscribingPage;
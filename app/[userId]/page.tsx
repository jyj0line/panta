const UserIdDynamicPage = async ({
  params,
}: {
  params: Promise<{ userId: string; }>
}) => {
  const { userId } = await params;

  return (
    <div className="">
      { userId }
    </div>
  )
}
export default UserIdDynamicPage;
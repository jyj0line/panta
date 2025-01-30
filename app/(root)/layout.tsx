import Header from '@/app/components/Header'
import Tabs from '@/app/components/TabBar'

const RootGroupLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='w-full md:w-[750px] lg:w-[1000px] xl:w-[1300px] mx-auto'>
      <Header/>
      <Tabs/>
      {children}
    </div>
  );
}
  
export default RootGroupLayout;
import { RootGroupHeaderWithTabBar } from '@/app/components/RootGroupHeaderWithTabBar'

const RootGroupLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='relative bg-powerbackground'>
      <RootGroupHeaderWithTabBar/>
      <div className='container'>
        {children}
      </div>
    </div>
  );
}
  
export default RootGroupLayout;
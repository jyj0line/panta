import RootGroupHT from '@/app/components/RootGroupHT'

const RootGroupLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='relative'>
      <RootGroupHT/>
      <div className='container h-[1200px]'>
        {children}
      </div>
    </div>
  );
}
  
export default RootGroupLayout;
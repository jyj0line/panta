import RootGroupHT from '@/app/components/RootGroupHT'

const RootGroupLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='relative bg-neutral-100'>
      <RootGroupHT/>
      <div className='container'>
        {children}
      </div>
    </div>
  );
}
  
export default RootGroupLayout;
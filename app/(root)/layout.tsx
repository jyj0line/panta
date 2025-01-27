const RootGroupLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    return (
      <div>
        root group layout
        {children}
      </div>
    )
  }
  
  export default RootGroupLayout;
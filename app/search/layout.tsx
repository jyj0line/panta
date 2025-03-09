import {SearchH} from '@/app/components/SearchH'

const SearchLayout = ({ children }: Readonly<{children: React.ReactNode}>) => {

  return(
    <div className='relative'>
      <SearchH/>
      {children}
    </div>
    )
}

export default SearchLayout
import {SearchHeader} from '@/app/components/SearchHeader'

const SearchLayout = ({ children }: Readonly<{children: React.ReactNode}>) => {

  return(
    <div className='relative'>
      <SearchHeader/>
      {children}
    </div>
    )
}
export default SearchLayout;
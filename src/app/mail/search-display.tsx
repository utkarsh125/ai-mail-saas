import React from 'react'
import { searchValueAtom } from './search-bar'
import { useAtom } from 'jotai'

const SearchDisplay = () => {
    const [searchValue] = useAtom(searchValueAtom)
  return (
    <div className='p-4 max-h-[calc(100vh-50px)] overflow-y-scroll'>
        <div className='flex items-center gap-2 mb-4'>
            <h2 className='text-gray-800 text-sm dark:text-gray-400'>
                Your search for &quot;{searchValue}&quot; came back with ...
            </h2>
        </div>
    </div>
  )
}

export default SearchDisplay
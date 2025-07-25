import React from 'react'

const Search = ({searchTerm,setSearchTerm}) => {
  return (
    <div className='search'>
    <div>
        <img src='search.svg'/>
        <input
            type='text'
            placeholder='search the movie'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)} //
        />
    </div>
    </div>
  )
}

export default Search

import React, { useEffect, useState } from 'react';
import {useDebounce} from 'react-use';
import Search from './components/Search';
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method : 'GET',
  headers : {
    accept : 'application/json',
    Authorization : `Bearer ${API_KEY}`
    }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  //debounce helps to prevent making too many api request
  //it keeps user waiting for 500ms to retyping
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try{
      const endpoint =  query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch (endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error ('Failed to fetch movies')
      }

      const data = await response.json();

      if (data.Response == 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      
      setMovieList(data.results || []);

      if(query && data.results.length > 0 ){
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally{
      setIsLoading(false);
    }

  }
  
  const loadTrendingMovies =async () => {
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);

    }catch(error){
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect( () => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect( () => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
    
    <div className='pattern'/>
      <div className='wrapper'>
      <div className='sitename'>
      <img className='movielogo' src='movielogo.png'/>
      <span><h3 className=''>MOVIEZILLA</h3></span>      
      </div>
      <header class="text-3xl font-bold">
        <img src='hero.png'/>
          <h1>Explore <span className='text-gradient'>the World</span> of Movies</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
          <h2>Trending Movies</h2>

          <ul>
            {trendingMovies.map((movie,index) => (
              <li key={movie.$id}>
              <p>{index + 1}</p>
              <img src={movie.poster_url} alt={movie.titile}/> 
              </li>
            ))}
          </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner/>
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
    </div>
    </main>
  )
}

export default App

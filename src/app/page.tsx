"use client";

import { useEffect, useState } from "react";
import SwipeCard, { Movie } from "@/components/SwipeCard";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

function RecommendationCard({ movie }: { movie: Movie }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(movie.poster_url);

  useEffect(() => {
    if (!movie.poster_url && movie.title) {
      const fetchPoster = async () => {
        try {
          const query = encodeURIComponent(movie.title);
          const apiKey = "15d2ea6d0dc1d476efbca3eba2b9bbfb"; // Public test API Key for TMDB
          const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=es-MX`);
          const data = await res.json();
          if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            setPosterUrl(`https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`);
          }
        } catch (e) {
          console.error("Error fetching poster", e);
        }
      };
      fetchPoster();
    } else {
        setPosterUrl(movie.poster_url);
    }
  }, [movie]);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)] group hover:border-pink-500/50 transition-all duration-300">
      <div className="h-[20rem] sm:h-[24rem] bg-gray-900/50 relative overflow-hidden">
         {posterUrl ? (
           <img src={posterUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={movie.title} />
         ) : (
           <div className="flex items-center justify-center h-full text-5xl opacity-50">🎥</div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
      </div>
      <div className="p-6 relative -mt-16 z-10">
        <h3 className="text-2xl font-black text-white drop-shadow-md leading-tight">{movie.title} {movie.year && <span className="text-sm font-medium text-gray-400">({movie.year})</span>}</h3>
        <p className="text-sm font-semibold text-cyan-400 mt-1 drop-shadow-sm">{movie.genres}</p>
        <p className="text-gray-300 mt-3 text-sm line-clamp-3 leading-relaxed">{movie.description || "Descripción no disponible para este título."}</p>
        <a 
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer español')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-5 block w-full text-center bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:scale-[1.02] transition-all active:scale-95"
        >
          Ver Tráiler
        </a>
      </div>
    </div>
  );
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [fetchingRecs, setFetchingRecs] = useState(false);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const username = `user_${Math.floor(Math.random() * 100000)}`;
        const res = await fetch(`${API_URL}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        setUserId(data.id);
        
        fetchRandomMovies();
      } catch (err) {
        console.error("Failed to initialize user", err);
      }
    };
    
    initUser();
  }, []);

  const fetchRandomMovies = async () => {
    try {
      const res = await fetch(`${API_URL}/movies/random?limit=30`);
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      } else {
        setMovies(Array.from({length: 30}).map((_, i) => ({
            id: i, title: `Película de Prueba ${i}`, genres: 'Acción', 
            poster_url: '', description: 'Descripción de prueba', year: 2026
        })));
      }
    } catch (err) {
      console.error("Failed to fetch movies", err);
      setMovies(Array.from({length: 30}).map((_, i) => ({
            id: i, title: `Película Muestra ${i}`, genres: 'Drama', 
            poster_url: '', description: 'Muestra', year: 2026
        })));
    }
  };

  const handleRate = async (movieId: number, rating: number | null) => {
    let currentRatings = ratingsCount;

    if (userId && rating !== null) {
      try {
        await fetch(`${API_URL}/users/${userId}/ratings/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movie_id: movieId, rating }),
        });
        currentRatings += 1;
        setRatingsCount(currentRatings);
      } catch (err) {
        console.error("Failed to save rating", err);
      }
    }

    if (currentRatings >= 10) {
      fetchRecommendations();
    } else if (currentIndex < movies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      fetchRandomMovies();
      setCurrentIndex(0);
    }
  };

  const fetchRecommendations = async () => {
    setFetchingRecs(true);
    try {
        await new Promise(res => setTimeout(res, 2000));
        const res = await fetch(`${API_URL}/users/${userId}/recommendations`);
        if (res.ok) {
            const data = await res.json();
            setRecommendations(data);
        } else {
            setRecommendations([{id: 100, title: 'Recomendación AI 1', genres: 'Sci-Fi', poster_url: '', description: '...', year: 2026}]);
        }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
      setRecommendations([{id: 100, title: 'AI Best Match 1', genres: 'Sci-Fi', poster_url: '', description: '...', year: 2026}]);
    }
    setFetchingRecs(false);
  };

  if (!userId || movies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        <div className="animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 text-2xl font-black tracking-widest drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">INICIALIZANDO CINEMA AI</div>
      </div>
    );
  }

  if (recommendations.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)] tracking-tight">
            Tus Mejores Recomendaciones
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recommendations.map((mov) => (
              <RecommendationCard key={mov.id} movie={mov} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (fetchingRecs) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
         <div className="relative z-10 w-24 h-24 border-4 border-pink-500 border-t-cyan-400 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(236,72,153,0.6)]"></div>
         <p className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 text-xl font-bold animate-pulse tracking-wide text-center px-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
           Ejecutando Modelo Neuronal... <br/>
           <span className="text-sm font-medium text-gray-400 mt-2 block">Analizando tus preferencias para encontrar tus mejores matches</span>
         </p>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {showInfo && (
        <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-50 md:w-96 bg-gray-900/90 backdrop-blur-xl border border-pink-500/50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
              <span className="text-2xl">🍿</span> ¿Cómo funciona?
            </h3>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed font-medium">
            Para darte recomendaciones personalizadas con nuestra IA, necesitamos conocer tus gustos primero. 
            <br/><br/>
            Califica <strong className="text-pink-400 text-base">10 películas</strong> deslizando la tarjeta o usando los botones inferiores. 
            <br/><br/>
            Si no has visto alguna, simplemente selecciona el botón de <strong>No vista 👁️</strong> (O desliza hacia arriba ⬆️) para saltarla. ¡Te seguiremos mostrando películas de reemplazo hasta que logres calificar 10!
          </p>
        </div>
      )}

      <div className="absolute top-8 md:top-12 text-center w-full px-4 z-20 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] mb-4 tracking-tight">
          Descubre Películas
        </h1>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full shadow-lg inline-block">
          <p className="text-gray-300 text-[11px] md:text-xs font-semibold tracking-wider flex items-center gap-3">
            <span>Desliza a la derecha {'>'} <span className="text-green-400 ml-1">💚 Me Gusta</span></span>
            <span className="text-gray-600">|</span>
            <span>{'<'} Desliza a la izquierda <span className="text-red-400 ml-1">❌ Paso</span></span>
            <span className="text-gray-600">|</span>
            <span>^ Desliza hacia arriba <span className="text-gray-400 font-normal ml-1">👁️ No vista</span></span>
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === ratingsCount ? 'w-8 bg-gradient-to-r from-cyan-400 to-pink-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : idx < ratingsCount ? 'w-3 bg-white/50' : 'w-3 bg-white/10'}`}></div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 w-full flex items-center justify-center mt-20 md:mt-16 px-4">
        {currentMovie && (
          <SwipeCard 
            key={currentMovie.id} 
            movie={currentMovie} 
            onRate={handleRate} 
          />
        )}
      </div>

      <div className="fixed bottom-8 flex z-20 bg-white/5 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] gap-4 md:gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        <button 
          onClick={() => handleRate(currentMovie.id, 1.0)} 
          className="w-[4.5rem] h-[3.5rem] md:w-[5.5rem] md:h-[4rem] bg-gray-950/80 border border-red-500/30 rounded-[1.25rem] flex items-center justify-center text-red-500 text-2xl shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:bg-red-500/10 transition-all active:scale-95"
          title="No me gusta"
        >
          ❌
        </button>
        <button 
          onClick={() => handleRate(currentMovie.id, null)} 
          className="w-[4.5rem] h-[3.5rem] md:w-[5.5rem] md:h-[4rem] bg-gray-950/80 border border-gray-400/30 rounded-[1.25rem] flex items-center justify-center text-gray-400 text-3xl shadow-[0_0_15px_rgba(156,163,175,0.1)] hover:shadow-[0_0_25px_rgba(156,163,175,0.4)] hover:bg-gray-400/10 transition-all active:scale-95 pb-1"
          title="No la he visto"
        >
          👁️‍🗨️
        </button>
        <button 
          onClick={() => handleRate(currentMovie.id, 5.0)} 
          className="w-[4.5rem] h-[3.5rem] md:w-[5.5rem] md:h-[4rem] bg-gray-950/80 border border-green-500/30 rounded-[1.25rem] flex items-center justify-center text-green-500 text-3xl shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:bg-green-500/10 transition-all active:scale-95"
          title="Me gusta"
        >
          💚
        </button>
      </div>
    </div>
  );
}

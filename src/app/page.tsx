"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import SwipeCard, { Movie } from "@/components/SwipeCard";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

export interface ExtendedMovie extends Movie {
  good_rating_count?: number;
  bad_rating_count?: number;
}

interface RecommendationCardProps {
  key?: React.Key | null;
  movie: ExtendedMovie;
  isTrending?: boolean;
}

function RecommendationCard({ movie, isTrending = false }: RecommendationCardProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(movie.poster_url);
  const [rated, setRated] = useState<boolean>(false);
  
  const totalRatings = (movie.good_rating_count || 0) + (movie.bad_rating_count || 0);
  const acceptancePercent = totalRatings > 0 ? Math.round(((movie.good_rating_count || 0) / totalRatings) * 100) : 0;

  const handleRateRec = async (isGood: boolean) => {
    if (rated) return;
    try {
      await fetch(`${API_URL}/movies/${movie.id}/recommendation-rating/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_good: isGood }),
      });
      setRated(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!movie.poster_url && movie.title) {
      const fetchPoster = async () => {
        try {
          const query = encodeURIComponent(movie.title);
          const apiKey = "15d2ea6d0dc1d476efbca3eba2b9bbfb";
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
    }
  }, [movie]);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)] group hover:border-pink-500/50 transition-all duration-300 flex flex-col h-full min-h-80">
      <div className="h-44 sm:h-52 shrink-0 bg-gray-900/50 relative overflow-hidden">
         {posterUrl ? (
           <Image
             src={posterUrl}
             alt={movie.title}
             fill
             sizes="(max-width: 640px) 100vw, 420px"
             className="object-cover group-hover:scale-105 transition-transform duration-500"
           />
         ) : (
           <div className="flex items-center justify-center h-full text-5xl opacity-50">🎥</div>
         )}
         <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
      </div>
      <div className="p-4 sm:p-5 relative -mt-6 z-10 flex flex-col flex-1 h-full">
        <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">{movie.title} {movie.year && <span className="text-xs sm:text-sm font-medium text-gray-400">({movie.year})</span>}</h3>
        
        {isTrending && totalRatings > 0 && (
           <div className="mt-2 inline-flex items-center bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
             <span className="text-xs sm:text-sm font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-cyan-400">
                {acceptancePercent}% Aceptación
             </span>
             <span className="text-[11px] text-gray-400 ml-2">({totalRatings} valoraciones)</span>
           </div>
        )}
        <p className="text-xs sm:text-sm font-semibold text-cyan-400 mt-1 drop-shadow-sm">{movie.genres}</p>
        <p className="text-gray-300 mt-2 text-sm line-clamp-2 leading-relaxed">{movie.description || "Descripción no disponible para este título."}</p>
        <div className="mt-auto pt-3 space-y-2.5">
          <a 
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer español')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full text-center bg-linear-to-r from-pink-500 to-cyan-500 text-white text-sm font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:scale-[1.02] transition-all active:scale-95"
          >
            Ver Tráiler
          </a>
          
          {!isTrending && (
            <div className="flex gap-2 w-full mt-2">
              <button 
                onClick={() => handleRateRec(false)} 
                disabled={rated}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${rated ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95'}`}
              >
                👎 Mala
              </button>
              <button 
                onClick={() => handleRateRec(true)} 
                disabled={rated}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${rated ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 active:scale-95'}`}
              >
                👍 Buena
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<ExtendedMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<ExtendedMovie[]>([]);
  const [fetchingRecs, setFetchingRecs] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [showInfo, setShowInfo] = useState(true);

  async function fetchRandomMovies() {
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
  }

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

  const handleRate = async (movieId: number, rating: number | null) => {
    if (isSubmittingRating || fetchingRecs) return;
    setIsSubmittingRating(true);
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
      await fetchRecommendations();
    } else if (currentIndex < movies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await fetchRandomMovies();
      setCurrentIndex(0);
    }

    setIsSubmittingRating(false);
  };

  const fetchRecommendations = async () => {
    setFetchingRecs(true);
    setRecommendations([]);
    setTrendingMovies([]);
    try {
        await new Promise(res => setTimeout(res, 2000));
        const [recRes, trendRes] = await Promise.all([
          fetch(`${API_URL}/users/${userId}/recommendations`),
          fetch(`${API_URL}/movies/trending`)
        ]);

        if (recRes.ok) {
            const data = await recRes.json();
            setRecommendations(data);
        } else {
            setRecommendations([{id: 100, title: 'Recomendación AI 1', genres: 'Sci-Fi', poster_url: '', description: '...', year: 2026}]);
        }
        
        if (trendRes.ok) {
            const trendData = await trendRes.json();
            setTrendingMovies(trendData);
        }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
      setRecommendations([{id: 100, title: 'AI Best Match 1', genres: 'Sci-Fi', poster_url: '', description: '...', year: 2026}]);
    }
    setFetchingRecs(false);
  };

  const handleBackToRating = async () => {
    setRecommendations([]);
    setTrendingMovies([]);
    setRatingsCount(0);
    setCurrentIndex(0);
    await fetchRandomMovies();
  };

  if (!userId || movies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        <div className="animate-pulse text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-cyan-400 text-2xl font-black tracking-widest drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">INICIALIZANDO CINEMA AI</div>
      </div>
    );
  }

  if (fetchingRecs) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"></div>
         <div className="relative z-10 w-24 h-24 border-4 border-pink-500 border-t-cyan-400 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(236,72,153,0.6)]"></div>
         <p className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-cyan-400 text-lg md:text-xl font-bold animate-pulse tracking-wide text-center px-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
           Ejecutando Modelo Neuronal... <br/>
           <span className="text-xs md:text-sm font-medium text-gray-300 mt-2 block">Esto puede llevar unos segundos.</span>
           <span className="text-xs md:text-sm font-medium text-gray-400 mt-1 block">Analizando tus preferencias para encontrar tus mejores matches</span>
         </p>
      </div>
    );
  }

  if (recommendations.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-310 mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)] tracking-tight">
              Tus Resultados
            </h1>
            <button
              onClick={handleBackToRating}
              className="self-start sm:self-auto px-4 py-2 rounded-xl text-sm font-bold border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 hover:border-cyan-300/60 transition-all"
            >
              Volver a calificar
            </button>
          </div>

          <section>
            <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-fuchsia-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.35)] tracking-tight">
              Tus Mejores Recomendaciones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {recommendations.map((mov: ExtendedMovie) => (
                <RecommendationCard key={mov.id} movie={mov} />
              ))}
            </div>
          </section>

          {trendingMovies.length > 0 && (
            <section>
              <h2 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] tracking-tight flex items-center gap-2">
                🔥 En Tendencia
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                {trendingMovies.map((mov: ExtendedMovie) => (
                  <RecommendationCard key={mov.id} movie={mov} isTrending={true} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="h-dvh bg-slate-950 flex flex-col items-center justify-between overflow-hidden relative font-sans pt-4 pb-4 md:pt-6 md:pb-6">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-100 h-100 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-1/4 right-1/4 w-100 h-100 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {showInfo && (
        <div className="absolute top-3 left-3 right-3 md:left-auto md:right-4 z-50 md:w-90 bg-gray-900/90 backdrop-blur-xl border border-pink-500/50 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-extrabold text-base md:text-lg flex items-center gap-2">
              <span className="text-2xl">🍿</span> ¿Cómo funciona?
            </h3>
            <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
          </div>
          <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-medium">
            Para darte recomendaciones personalizadas con nuestra IA, necesitamos conocer tus gustos primero. 
            <br/><br/>
            Califica <strong className="text-pink-400 text-base">10 películas</strong> deslizando la tarjeta o usando los botones inferiores. 
            <br/><br/>
            Si no has visto alguna, simplemente selecciona el botón de <strong>No vista 👁️</strong> (O desliza hacia arriba ⬆️) para saltarla. ¡Te seguiremos mostrando películas de reemplazo hasta que logres calificar 10!
          </p>
        </div>
      )}

      {/* Top Header Area */}
      <div className="w-full max-w-4xl px-3 md:px-5 z-20 flex flex-col items-center shrink-0">
        <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-pink-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] mb-2 md:mb-3 tracking-tight text-center leading-tight">
          Descubre Películas
        </h1>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 md:px-4 py-1.5 rounded-full shadow-lg inline-block max-w-[95%] text-center">
          <p className="text-gray-300 text-[10px] md:text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 md:gap-2.5 flex-wrap leading-relaxed">
            <span className="whitespace-nowrap">Derecha {'>'} <span className="text-green-400 ml-0.5">💚</span></span>
            <span className="text-gray-600 hidden sm:inline">|</span><span className="text-gray-600 sm:hidden">&bull;</span>
            <span className="whitespace-nowrap">{'<'} Izquierda <span className="text-red-400 ml-0.5">❌</span></span>
            <span className="text-gray-600 hidden sm:inline">|</span><span className="text-gray-600 sm:hidden">&bull;</span>
            <span className="whitespace-nowrap">^ Arriba <span className="text-gray-400 font-normal ml-0.5">👁️</span></span>
          </p>
        </div>
        <p className="mt-2 text-xs text-gray-400">Has calificado {ratingsCount}/10 películas</p>
        <div className="mt-3 md:mt-4 flex justify-center gap-1.5 md:gap-2">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === ratingsCount ? 'w-6 md:w-8 bg-linear-to-r from-cyan-400 to-pink-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : idx < ratingsCount ? 'w-2.5 md:w-3 bg-white/50' : 'w-2.5 md:w-3 bg-white/10'}`}></div>
          ))}
        </div>
      </div>
      
      {/* SwipeCard Area */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center px-3 md:px-4 min-h-0 my-2 md:my-3">
        {currentMovie && (
          <SwipeCard 
            key={currentMovie.id} 
            movie={currentMovie} 
            onRate={handleRate} 
          />
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="flex z-20 bg-white/5 backdrop-blur-2xl border border-white/10 p-2 md:p-2.5 rounded-[1.4rem] gap-2.5 md:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] shrink-0">
        <button 
          onClick={() => handleRate(currentMovie.id, 1.0)} 
          disabled={isSubmittingRating || fetchingRecs}
          className="w-13 h-11 md:w-18 md:h-14 bg-gray-950/80 border border-red-500/30 rounded-[0.9rem] md:rounded-[1.1rem] flex items-center justify-center text-red-500 text-lg md:text-2xl shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:bg-red-500/10 transition-all active:scale-95"
          title="No me gusta"
        >
          ❌
        </button>
        <button 
          onClick={() => handleRate(currentMovie.id, null)} 
          disabled={isSubmittingRating || fetchingRecs}
          className="w-13 h-11 md:w-18 md:h-14 bg-gray-950/80 border border-gray-400/30 rounded-[0.9rem] md:rounded-[1.1rem] flex items-center justify-center text-xl md:text-2xl text-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.1)] hover:shadow-[0_0_25px_rgba(156,163,175,0.4)] hover:bg-gray-400/10 transition-all active:scale-95 pb-1"
          title="No la he visto"
        >
          👁️‍🗨️
        </button>
        <button 
          onClick={() => handleRate(currentMovie.id, 5.0)} 
          disabled={isSubmittingRating || fetchingRecs}
          className="w-13 h-11 md:w-18 md:h-14 bg-gray-950/80 border border-green-500/30 rounded-[0.9rem] md:rounded-[1.1rem] flex items-center justify-center text-xl md:text-2xl text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:bg-green-500/10 transition-all active:scale-95"
          title="Me gusta"
        >
          💚
        </button>
      </div>
    </div>
  );
}

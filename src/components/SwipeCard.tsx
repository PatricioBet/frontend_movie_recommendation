"use client";

import React, { useState, useEffect } from 'react';

export interface Movie {
  id: number;
  title: string;
  genres: string | null;
  poster_url: string | null;
  description: string | null;
  year: number | null;
}

interface SwipeCardProps {
  movie: Movie;
  onRate: (movieId: number, rating: number | null) => void;
}

export default function SwipeCard({ movie, onRate }: SwipeCardProps) {
  const [{ x, y }, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [posterUrl, setPosterUrl] = useState<string | null>(movie.poster_url);

  useEffect(() => {
    setPos({ x: 0, y: 0 });
    
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

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - x);
    setStartY(e.clientY - y);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - startX, y: e.clientY - startY }); 
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const swipeThreshold = 100;
    if (x > swipeThreshold) {
      onRate(movie.id, 5.0);
    } else if (x < -swipeThreshold) {
      onRate(movie.id, 1.0);
    } else if (y < -swipeThreshold) {
      onRate(movie.id, null); // null signifies "Haven't seen it"
    } else {
      setPos({ x: 0, y: 0 });
    }
  };

  return (
    <div
      className="relative w-full max-w-[340px] md:max-w-[380px] rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-white/20 backdrop-blur-2xl border border-white/30 touch-none select-none"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${x / 20}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="h-[25rem] sm:h-[28rem] w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-transparent to-transparent z-10 pointer-events-none"></div>
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover pointer-events-none border-b-0" />
        ) : (
           <div className="w-full h-full bg-gray-800 flex items-center justify-center">
             <span className="text-gray-500 text-6xl">🎥</span>
           </div>
        )}
      </div>
      <div className="px-6 pb-6 pt-4 bg-transparent pointer-events-none relative z-20 -mt-20">
        <h2 className="text-3xl font-extrabold text-white mb-1 drop-shadow-md tracking-tight leading-tight">
          {movie.title} {movie.year && <span className="text-xl font-medium text-gray-300">({movie.year})</span>}
        </h2>
        <p className="text-sm font-semibold text-pink-400 mb-2 drop-shadow-sm">{movie.genres}</p>
        <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">{movie.description || 'Descripción no disponible para este título.'}</p>
      </div>
      
      {/* Visual Feedback Overlays */}
      <div className={`absolute top-12 right-6 border-[3px] border-green-400 text-green-400 text-3xl font-black px-4 py-1 rounded-xl transform rotate-12 transition-opacity duration-200 ${x > 50 && Math.abs(y) < 50 ? 'opacity-100' : 'opacity-0'} pointer-events-none bg-green-900/40 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] z-30`}>
        ME GUSTA
      </div>
      <div className={`absolute top-12 left-6 border-[3px] border-red-500 text-red-500 text-3xl font-black px-4 py-1 rounded-xl transform -rotate-12 transition-opacity duration-200 ${x < -50 && Math.abs(y) < 50 ? 'opacity-100' : 'opacity-0'} pointer-events-none bg-red-900/40 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] z-30`}>
        PASO
      </div>
      <div className={`absolute bottom-32 left-0 right-0 mx-auto w-56 text-center border-[3px] border-gray-300 text-gray-300 text-2xl font-black px-4 py-2 rounded-xl transition-opacity duration-200 ${y < -50 && Math.abs(x) < 50 ? 'opacity-100' : 'opacity-0'} pointer-events-none bg-gray-900/60 backdrop-blur-sm z-30`}>
        NO LA HE VISTO
      </div>
    </div>
  );
}

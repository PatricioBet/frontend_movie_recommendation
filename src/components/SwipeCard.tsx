"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";

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
  const [isRated, setIsRated] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [posterUrl, setPosterUrl] = useState<string | null>(movie.poster_url);
  const [isHinting, setIsHinting] = useState(false);

  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setInterval>;

    const playHintAnimation = () => {
      if (isDragging) return;
      setIsHinting(true);
      setTimeout(() => setIsHinting(false), 800);
    };

    const initialTimeout = setTimeout(playHintAnimation, 1000);

    const resetTimer = () => {
      clearInterval(inactivityTimer);
      inactivityTimer = setInterval(playHintAnimation, 5000);
    };

    resetTimer();

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(inactivityTimer);
    };
  }, [isDragging]);

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
    }
  }, [movie]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isRated) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
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
    if (isRated) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const swipeThreshold = 100;
    if (x > swipeThreshold) {
      setIsRated(true);
      onRate(movie.id, 5.0);
    } else if (x < -swipeThreshold) {
      setIsRated(true);
      onRate(movie.id, 1.0);
    } else if (y < -swipeThreshold) {
      setIsRated(true);
      onRate(movie.id, null); // null signifies "Haven't seen it"
    } else {
      setPos({ x: 0, y: 0 });
    }
  };

  return (
    <div className={`relative w-full max-w-72 md:max-w-80 z-10 transition-transform ${isHinting ? 'animate-card-hint' : ''}`}>
      <div
        className="relative w-full rounded-[1.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden bg-white/20 backdrop-blur-2xl border border-white/30 touch-none select-none"
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
        <div className="h-[47vh] min-h-56 max-h-88 sm:max-h-96 w-full relative">
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/95 via-transparent to-transparent z-10 pointer-events-none"></div>
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover pointer-events-none border-b-0"
          />
        ) : (
           <div className="w-full h-full bg-gray-800 flex items-center justify-center">
             <span className="text-gray-500 text-6xl">🎥</span>
           </div>
        )}
      </div>
      <div className="px-4 md:px-5 pb-4 md:pb-5 pt-3 bg-transparent pointer-events-none relative z-20 -mt-16 md:-mt-18">
        <h2 className="text-2xl md:text-[1.7rem] font-extrabold text-white mb-1 drop-shadow-md tracking-tight leading-tight">
          {movie.title} {movie.year && <span className="text-base md:text-lg font-medium text-gray-300">({movie.year})</span>}
        </h2>
        <p className="text-xs md:text-sm font-semibold text-pink-400 mb-1.5 drop-shadow-sm">{movie.genres}</p>
        <p className="text-gray-300/90 text-xs md:text-sm leading-relaxed line-clamp-2">{movie.description || 'Descripción no disponible para este título.'}</p>
      </div>
      
      {/* Visual Feedback Overlays */}
      <div className={`absolute top-8 right-4 border-[3px] border-green-400 text-green-400 text-xl md:text-2xl font-black px-3 py-1 rounded-xl transform rotate-12 transition-opacity duration-200 ${x > 50 && Math.abs(y) < 50 ? 'opacity-100' : 'opacity-0'} pointer-events-none bg-green-900/40 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] z-30`}>
        ME GUSTA
      </div>
      <div className={`absolute top-8 left-4 border-[3px] border-red-500 text-red-500 text-xl md:text-2xl font-black px-3 py-1 rounded-xl transform -rotate-12 transition-opacity duration-200 ${x < -50 && Math.abs(y) < 50 ? 'opacity-100' : 'opacity-0'} pointer-events-none bg-red-900/40 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] z-30`}>
        PASO
      </div>
      <div className={`absolute bottom-24 left-0 right-0 mx-auto w-44 md:w-52 text-center border-[3px] border-gray-300 text-gray-300 text-lg md:text-xl font-black px-3 py-2 rounded-xl transition-opacity duration-200 ${y < -50 && Math.abs(x) < 50 ? 'opacity-100' : 'opacity-0'} pointer-events-none bg-gray-900/60 backdrop-blur-sm z-30`}>
        NO LA HE VISTO
      </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';

interface RaffleImageGalleryProps {
  images: string[];
  title: string;
}

export function RaffleImageGallery({ images, title }: RaffleImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const photoList = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % photoList.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  return (
    <div className="space-y-2">
      {/* Imagem Principal com Formato 16:9 / 4:3 Comportado no Mobile */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group">
        <img
          src={photoList[currentIndex]}
          alt={`${title} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

        {/* Botões de Navegação se tiver mais de 1 foto */}
        {photoList.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700 active:scale-90 transition-all backdrop-blur"
              aria-label="Foto anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/80 hover:bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700 active:scale-90 transition-all backdrop-blur"
              aria-label="Próxima foto"
            >
              →
            </button>

            {/* Contador de Fotos */}
            <div className="absolute top-3 right-3 bg-slate-950/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-slate-800 backdrop-blur shadow-md">
              📷 {currentIndex + 1} / {photoList.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas (Thumbnails) abaixo da foto principal */}
      {photoList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-0.5">
          {photoList.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border transition-all active:scale-95 ${
                currentIndex === idx
                  ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-105'
                  : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

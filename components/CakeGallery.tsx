import React from 'react';
import { PastCake } from '../types';
import { PAST_CAKES } from '../constants';

interface CakeGalleryProps {
  onSelectCake: (cake: PastCake) => void;
}

const CakeGallery: React.FC<CakeGalleryProps> = ({ onSelectCake }) => (
  <div>
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-stone-800">Custom Cake Gallery</h1>
      <p className="text-stone-500 mt-2 max-w-xl mx-auto">
        Browse our past creations for inspiration, then tell us what you have in mind.
      </p>
      <p className="text-stone-400 text-xs mt-1">Tap a cake to view it full-size and use it as inspiration for your order.</p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {PAST_CAKES.map((cake) => (
        <div
          key={cake.name}
          className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onSelectCake(cake)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectCake(cake); }}
          aria-label={`View ${cake.name}`}
        >
          <img
            src={cake.image}
            alt={cake.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
          {/* Name — top center */}
          <p className="absolute top-3 inset-x-0 text-center text-white text-sm font-semibold drop-shadow-lg leading-tight px-2">{cake.name}</p>
        </div>
      ))}
    </div>
  </div>
);

export default CakeGallery;

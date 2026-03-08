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
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {PAST_CAKES.map((cake) => (
        <button
          key={cake.name}
          onClick={() => onSelectCake(cake)}
          className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          aria-label={`View ${cake.name}`}
        >
          <img
            src={cake.image}
            alt={cake.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <p className="text-white text-sm font-semibold leading-tight text-left">{cake.name}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default CakeGallery;

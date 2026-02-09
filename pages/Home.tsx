import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Star } from 'lucide-react';

const Home: React.FC = () => {
  const { products } = useStore();
  const featured = products.slice(0, 3); // Just show first 3 as best sellers

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-rose-100 rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0">
          <img 
            src="https://picsum.photos/1200/600?grayscale&blur=2" 
            alt="Bakery background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Sweetness in Every Bite
          </h1>
          <p className="mt-6 text-xl text-stone-700 max-w-3xl mx-auto">
            Homemade cakes, cookies, and pastries baked with passion. 
            Try our famous Brookies today!
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4">
            <Link
              to="/menu"
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-rose-500 hover:bg-rose-600 md:py-4 md:text-lg transition-transform hover:scale-105"
            >
              Order Now
            </Link>
            <Link
              to="/custom-cake"
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-rose-700 bg-rose-100 hover:bg-rose-200 md:py-4 md:text-lg"
            >
              Custom Cakes
            </Link>
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold text-stone-800">Best Sellers</h2>
          <Link to="/menu" className="text-rose-500 hover:text-rose-600 flex items-center gap-1">
            View full menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-100">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-stone-200 xl:aspect-w-7 xl:aspect-h-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover object-center group-hover:opacity-75 transition-opacity"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-stone-900">
                  <Link to="/menu">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-stone-500">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-medium text-stone-900">₱{product.price}</p>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-stone-100">
        <h2 className="text-3xl font-bold text-stone-800 text-center mb-10">Why Choose Baked by Iyah?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 text-2xl">
              🎂
            </div>
            <h3 className="font-semibold text-lg mb-2">Quality Ingredients</h3>
            <p className="text-stone-600">We use only premium ingredients to ensure the best taste and texture.</p>
          </div>
          <div className="p-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 text-2xl">
              🍪
            </div>
            <h3 className="font-semibold text-lg mb-2">Freshly Baked</h3>
            <p className="text-stone-600">Baked fresh daily or upon order. You get it straight from the oven.</p>
          </div>
          <div className="p-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 text-2xl">
              🚚
            </div>
            <h3 className="font-semibold text-lg mb-2">Convenient Delivery</h3>
            <p className="text-stone-600">Delivery available within Obando and Valenzuela areas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
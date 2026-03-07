import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';

const WHY_CHOOSE_US = [
  { emoji: '🎂', bg: 'bg-rose-100',    text: 'text-rose-500',    title: 'Quality Ingredients',  desc: 'We use only premium ingredients to ensure the best taste and texture.' },
  { emoji: '🍪', bg: 'bg-amber-100',   text: 'text-amber-500',   title: 'Freshly Baked',        desc: 'Baked fresh daily or upon order. You get it straight from the oven.' },
  { emoji: '🚚', bg: 'bg-emerald-100', text: 'text-emerald-500', title: 'Convenient Delivery',  desc: 'Delivery available within Obando and Valenzuela areas.' },
];

const Home: React.FC = () => {
  const { products } = useStore();
  const featured = useMemo(() => products.slice(0, 3), [products]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-rose-100 rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80" 
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
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none flex justify-center">
            <Link
              to="/menu"
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-rose-500 hover:bg-rose-600 md:py-4 md:text-lg transition-transform hover:scale-105 shadow-lg"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Cake Section */}
      <div className="bg-rose-50 rounded-2xl p-8 md:p-12 shadow-sm border border-rose-100 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-stone-800 mb-4">Want a Customized Cake?</h2>
          <p className="text-lg text-stone-600 mb-6">
            Make your celebration extra special with a cake designed just for you. 
            Choose your flavors, size, and design, and we'll bring your vision to life!
          </p>
          <Link
            to="/custom-cake"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-rose-700 bg-white hover:bg-rose-50 border-rose-200 shadow-sm transition-colors"
          >
            Request Custom Cake
          </Link>
        </div>
        <div className="flex-1">
          <img 
            src="https://scontent-mnl3-2.xx.fbcdn.net/v/t39.30808-6/558939381_1210811791067334_6373385866712100654_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Bdi3l90q9aYQ7kNvwF9woyd&_nc_oc=Adleq1tr14Fukr-0sol_TCO96Q8STKv-MZik09t9II1Reu8xPg3gCKlNAduKeirnDPw&_nc_zt=23&_nc_ht=scontent-mnl3-2.xx&_nc_gid=zBAs3kSBlvIZQcuqqOhBKw&_nc_ss=8&oh=00_AfzKyKwkLsWGkOHnvITTE3bbFSZxYkGKBzf-JXQoa-5AHw&oe=69B08129" 
            alt="Custom Cake Example" 
            className="rounded-xl shadow-md w-full object-cover h-64 md:h-80"
          />
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
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="p-4">
              <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4 ${item.text} text-2xl`}>
                {item.emoji}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-stone-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
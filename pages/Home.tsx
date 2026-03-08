import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Award, ChefHat, Truck, ShoppingCart, LucideIcon } from 'lucide-react';
import { UserRole } from '../types';
import FadeIn from '../components/FadeIn';

const WHY_CHOOSE_US: { Icon: LucideIcon; bg: string; text: string; title: string; desc: string }[] = [
  { Icon: Award,   bg: 'bg-rose-100',    text: 'text-rose-500',    title: 'Quality Ingredients', desc: 'We use only premium ingredients to ensure the best taste and texture.' },
  { Icon: ChefHat, bg: 'bg-amber-100',   text: 'text-amber-500',   title: 'Freshly Baked',       desc: 'Baked fresh daily or upon order. You get it straight from the oven.' },
  { Icon: Truck,   bg: 'bg-emerald-100', text: 'text-emerald-500', title: 'Convenient Delivery', desc: 'Delivery available within Obando and Valenzuela areas.' },
];

const Home: React.FC = () => {
  const { products, addToCart, user } = useStore();
  const featured = useMemo(() => products.slice(0, 3), [products]);

  return (
    <div className="space-y-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[580px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark rose gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/85 via-rose-900/70 to-rose-800/30" />

        <div className="relative px-8 sm:px-14 lg:px-20 py-20 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Sweetness<br />in Every Bite
          </h1>
          <p className="mt-5 text-lg text-rose-100 leading-relaxed max-w-md">
            Homemade cakes, cookies, and pastries baked with passion out of Obando, Bulacan.
            Try our famous Brookies today!
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-full text-white bg-rose-500 hover:bg-rose-400 transition-all hover:scale-105 shadow-lg"
            >
              Order Now <ArrowRight className="w-4 h-4" />
            </Link>
            {user?.role !== UserRole.ADMIN && (
              <Link
                to="/custom-cake"
                className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-full text-white border-2 border-white/60 hover:bg-white/10 transition-all"
              >
                Custom Cake
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Best Sellers ─────────────────────────────────────────────────── */}
      <FadeIn>
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-bold text-stone-800">Best Sellers</h2>
            <Link to="/menu" className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-sm font-medium">
              View full menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-100 flex flex-col">
                {/* Image + overlays */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Stock badge */}
                  {product.stock === 0 ? (
                    <span className="absolute top-3 left-3 bg-stone-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Out of stock</span>
                  ) : product.stock <= 5 && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Only {product.stock} left</span>
                  )}
                  {/* Quick-add button slides up on hover */}
                  {user?.role !== UserRole.ADMIN && product.stock > 0 && (
                    <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  )}
                </div>
                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                  <Link to="/menu" className="text-lg font-semibold text-stone-900 hover:text-rose-500 transition-colors line-clamp-1">
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone-500 line-clamp-2 flex-1">{product.description}</p>
                  <p className="mt-3 text-xl font-bold text-rose-600">₱{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Custom Cake Banner ───────────────────────────────────────────── */}
      <FadeIn delay="delay-100">
        <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[520px] flex items-center bg-rose-700">
          <img
            src="https://scontent-mnl3-2.xx.fbcdn.net/v/t39.30808-6/558939381_1210811791067334_6373385866712100654_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Bdi3l90q9aYQ7kNvwF9woyd&_nc_oc=Adleq1tr14Fukr-0sol_TCO96Q8STKv-MZik09t9II1Reu8xPg3gCKlNAduKeirnDPw&_nc_zt=23&_nc_ht=scontent-mnl3-2.xx&_nc_gid=zBAs3kSBlvIZQcuqqOhBKw&_nc_ss=8&oh=00_AfzKyKwkLsWGkOHnvITTE3bbFSZxYkGKBzf-JXQoa-5AHw&oe=69B08129"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/90 to-rose-950/45" />
          <div className="relative px-8 sm:px-14 py-14 max-w-lg">
            <span className="inline-block text-rose-300 text-xs font-bold uppercase tracking-widest mb-3">Made to order</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              A Cake Designed<br />Just for You
            </h2>
            <p className="text-rose-100 text-base leading-relaxed mb-8">
              Make your celebration extra special. Choose your flavors, size, and design —
              we'll bring your vision to life.
            </p>
            <Link
              to="/custom-cake"
              className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold rounded-full bg-white text-rose-700 hover:bg-rose-50 transition-all hover:scale-105 shadow-md"
            >
              Request Custom Cake <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* ── Why Choose Us ────────────────────────────────────────────────── */}
      <FadeIn delay="delay-150">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-stone-100">
          <h2 className="text-3xl font-bold text-stone-800 text-center mb-10">Why Choose Baked by Iyah?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY_CHOOSE_US.map(({ Icon, bg, text, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl hover:bg-stone-50 transition-colors">
                <div className={`flex-shrink-0 w-12 h-12 ${bg} rounded-xl flex items-center justify-center ${text}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

    </div>
  );
};

export default Home;
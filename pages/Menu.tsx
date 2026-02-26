import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { Search, Plus } from 'lucide-react';

const ProductCard: React.FC<{ product: any, addToCart: any }> = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (val: number) => {
    if (val >= 1 && val <= product.stock) {
      setQuantity(val);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${product.stock === 0 ? 'grayscale' : ''}`}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1 rounded-full font-bold transform -rotate-12 border-2 border-white">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className="font-bold text-lg text-stone-900">₱{product.price}</span>
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">{product.name}</h3>
        <p className="text-stone-500 text-sm mb-4 flex-grow">{product.description}</p>
        
        <div className="mt-auto space-y-3">
          <span className={`text-sm ${product.stock > 5 ? 'text-green-600' : 'text-amber-600'}`}>
            {product.stock > 0 ? `${product.stock} items left` : 'Out of Stock'}
          </span>
          
          <div className="flex items-center justify-between gap-2">
            {product.stock > 0 && (
              <div className="flex items-center border border-stone-200 rounded-lg">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-12 text-center border-none focus:ring-0 p-0 text-sm"
                  min="1"
                  max={product.stock}
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                product.stock > 0 
                  ? 'bg-stone-900 text-white hover:bg-stone-700' 
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Menu: React.FC = () => {
  const { products, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.price - b.price;
      });
  }, [products, selectedCategory, sortBy, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-stone-800">Our Menu</h1>
        <p className="text-stone-500 mt-2">Delicious treats baked with love.</p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200">
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['All', ...Object.values(ProductCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 w-full"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
            className="px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-500">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
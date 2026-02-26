import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, History } from 'lucide-react';
import { Modal } from '../components/Modal';

const Cart: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, user, orders } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cart' | 'history'>('cart');
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  useEffect(() => {
    // Removed the automatic notification on mount to rely on the modal instead
  }, [user]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      setShowLoginWarning(true);
      return;
    }
    navigate('/checkout');
  };

  const handleQuantityChange = (itemId: string, val: string) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
      updateCartQuantity(itemId, num);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Modal
        isOpen={showLoginWarning}
        onClose={() => setShowLoginWarning(false)}
        type="warning"
        title="Login Required"
        message="You need to be logged in to proceed to checkout. Please log in or create an account to continue."
        primaryAction={{
          label: 'Log In',
          onClick: () => navigate('/login')
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setShowLoginWarning(false)
        }}
      />
      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8">
        <button
          className={`pb-4 px-6 font-medium text-sm transition-colors relative ${
            activeTab === 'cart' ? 'text-rose-600' : 'text-stone-500 hover:text-stone-700'
          }`}
          onClick={() => setActiveTab('cart')}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            My Cart ({cart.length})
          </div>
          {activeTab === 'cart' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600" />
          )}
        </button>
        <button
          className={`pb-4 px-6 font-medium text-sm transition-colors relative ${
            activeTab === 'history' ? 'text-rose-600' : 'text-stone-500 hover:text-stone-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Order History
          </div>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600" />
          )}
        </button>
      </div>

      {activeTab === 'cart' ? (
        <>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
              <h2 className="text-2xl font-bold text-stone-800 mb-4">Your cart is empty</h2>
              <p className="text-stone-500 mb-8">Looks like you haven't added any sweets yet.</p>
              <button onClick={() => navigate('/menu')} className="text-rose-500 font-medium hover:text-rose-600">
                Go to Menu &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex gap-4">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-stone-800 text-lg">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-stone-500">₱{item.price}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-12 text-center border border-stone-200 rounded py-1 text-sm font-medium"
                          min="1"
                        />
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 sticky top-24">
                  <h3 className="font-bold text-stone-800 mb-4 text-lg">Summary</h3>
                  <div className="flex justify-between mb-4 text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-stone-900">₱{subtotal}</span>
                  </div>
                  <p className="text-xs text-stone-400 mb-6">Delivery fees and taxes calculated at checkout.</p>
                  <button 
                    onClick={handleProceedToCheckout}
                    className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {!user ? (
            <div className="text-center py-12">
              <p className="text-stone-500 mb-4">Please login to view your order history.</p>
              <button onClick={() => navigate('/login')} className="text-rose-600 font-medium hover:underline">Login Now</button>
            </div>
          ) : orders.filter(o => o.userId === user.id).length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              No past orders found.
            </div>
          ) : (
            orders.filter(o => o.userId === user.id).map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-stone-800">{order.id}</h3>
                    <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-stone-600">{item.quantity}x {item.name}</span>
                      <span>₱{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.isCustomInquiry && (
                    <div className="text-sm text-stone-600 italic">
                      Custom Cake Inquiry: {order.customDetails?.size}
                    </div>
                  )}
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-stone-900">
                  <span>Total</span>
                  <span>₱{order.totalAmount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
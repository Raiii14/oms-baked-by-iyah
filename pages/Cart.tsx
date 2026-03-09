import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, ShoppingBag, History, Cake, ImageIcon } from 'lucide-react';
import { Modal } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatTime } from '../utils/dateUtils';
import { UserRole } from '../types';

const CART_TABS = ['cart', 'history', 'custom'] as const;
type CartTab = typeof CART_TABS[number];

const Cart: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, user, orders } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: CartTab = (CART_TABS.includes(searchParams.get('tab') as CartTab)
    ? searchParams.get('tab') as CartTab
    : 'cart');
  const setActiveTab = (tab: CartTab) => setSearchParams({ tab }, { replace: true });
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  // Redirect admins to dashboard
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const handleProceedToCheckout = () => {
    if (user?.role === UserRole.ADMIN) {
      alert("Admins cannot place orders.");
      return;
    }

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
          onClick: () => navigate('/login?redirect=/cart')
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setShowLoginWarning(false)
        }}
      />
      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto">
        <button
          className={`pb-4 px-6 font-medium text-sm transition-colors relative whitespace-nowrap ${
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
          className={`pb-4 px-6 font-medium text-sm transition-colors relative whitespace-nowrap ${
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
        <button
          className={`pb-4 px-6 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'custom' ? 'text-rose-600' : 'text-stone-500 hover:text-stone-700'
          }`}
          onClick={() => setActiveTab('custom')}
        >
          <div className="flex items-center gap-2">
            <Cake className="w-4 h-4" />
            Custom Cakes
          </div>
          {activeTab === 'custom' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-600" />
          )}
        </button>
      </div>

      {activeTab === 'cart' && (
        <>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
              <ShoppingBag className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-stone-800 mb-3">Your cart is empty</h2>
              <p className="text-stone-500 mb-8">Looks like you haven't added any sweets yet.</p>
              <button onClick={() => navigate('/menu')} className="text-rose-500 font-medium hover:text-rose-600">
                Go to Menu &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex gap-0">
                    {/* Image */}
                    <div className="w-28 sm:w-32 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-stone-800 text-base leading-tight">{item.name}</h3>
                          <p className="text-sm text-stone-400 mt-0.5">₱{item.price.toLocaleString()} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors font-bold text-base"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-10 h-8 text-center text-sm font-semibold bg-white border-x border-stone-200 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                          />
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors font-bold text-base"
                          >
                            +
                          </button>
                        </div>
                        {/* Item subtotal */}
                        <p className="font-bold text-stone-800 text-base">₱{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
                  <h3 className="font-bold text-stone-800 mb-5 text-lg">Order Summary</h3>
                  <div className="space-y-3 mb-5">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-stone-500">
                        <span className="truncate mr-2">{item.quantity}× {item.name}</span>
                        <span className="font-medium text-stone-700 flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 pt-4 mb-1">
                    <div className="flex justify-between font-bold text-stone-900 text-lg">
                      <span>Subtotal</span>
                      <span>₱{subtotal.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">Delivery fees & taxes at checkout.</p>
                  </div>
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full mt-5 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {!user ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <History className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">Please login to view your order history.</p>
              <button onClick={() => navigate('/login')} className="text-rose-600 font-medium hover:underline">Login Now</button>
            </div>
          ) : orders.filter(o => o.userId === user.id && !o.isCustomInquiry).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <History className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500">No past orders found.</p>
            </div>
          ) : (
            orders.filter(o => o.userId === user.id && !o.isCustomInquiry).map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-stone-50/60 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-base font-bold font-mono tracking-wide bg-stone-100 text-stone-700 px-3 py-1 rounded-lg">{order.id}</span>
                  </div>
                  <StatusBadge status={order.status} className="self-start sm:self-auto" />
                </div>

                {/* Meta */}
                <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-stone-100">
                  {[
                    `Ordered: ${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    `Needed: ${new Date(order.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${formatTime(order.scheduledTime)}`,
                    order.paymentMethod,
                  ].map((item, i) => (
                    <span key={i} className="bg-stone-100 text-stone-500 text-xs px-2.5 py-1 rounded-full">{item}</span>
                  ))}
                </div>

                {/* Items with thumbnails */}
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Items</p>
                  <ul className="space-y-2.5">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-stone-100 border border-stone-100"
                        />
                        <span className="text-stone-600 text-sm flex-1">{item.quantity}× {item.name}</span>
                        <span className="font-medium text-stone-700 text-sm flex-shrink-0">₱{(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total footer */}
                <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total</p>
                  <p className="text-xl font-bold text-stone-800">₱{order.totalAmount.toLocaleString()}</p>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          {!user ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <Cake className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">Please login to view your custom cake inquiries.</p>
              <button onClick={() => navigate('/login')} className="text-rose-600 font-medium hover:underline">Login Now</button>
            </div>
          ) : orders.filter(o => o.userId === user.id && o.isCustomInquiry).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <Cake className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500 mb-3">No custom cake inquiries found.</p>
              <button onClick={() => navigate('/custom-cake')} className="text-rose-600 font-medium hover:underline">Request a Quote</button>
            </div>
          ) : (
            orders.filter(o => o.userId === user.id && o.isCustomInquiry).map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-stone-50/60 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <Cake className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-base font-bold font-mono tracking-wide bg-stone-100 text-stone-700 px-3 py-1 rounded-lg">{inquiry.id}</span>
                  </div>
                  <StatusBadge status={inquiry.status} className="self-start sm:self-auto" />
                </div>

                {/* Meta */}
                <div className="px-5 py-3 flex flex-wrap items-center gap-2 border-b border-stone-100">
                  {[
                    `Submitted: ${new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    `Needed: ${new Date(inquiry.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                  ].map((item, i) => (
                    <span key={i} className="bg-stone-100 text-stone-500 text-xs px-2.5 py-1 rounded-full">{item}</span>
                  ))}
                </div>

                {/* Cake Details */}
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Cake Details</p>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-stone-400 font-medium">Size</span>
                      <span className="text-sm font-semibold text-stone-700">{inquiry.customDetails?.size || '—'}</span>
                    </div>
                    {inquiry.customDetails?.servings && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-stone-400 font-medium">Servings</span>
                        <span className="text-sm text-stone-700">{inquiry.customDetails.servings}</span>
                      </div>
                    )}
                    {inquiry.customDetails?.flavor && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-stone-400 font-medium">Flavor</span>
                        <span className="text-sm text-stone-700">{inquiry.customDetails.flavor}</span>
                      </div>
                    )}
                    {inquiry.customDetails?.cakeMessage && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-stone-400 font-medium">Message on Cake</span>
                        <span className="text-sm text-stone-700 text-right max-w-[60%]">{inquiry.customDetails.cakeMessage}</span>
                      </div>
                    )}
                    {inquiry.customDetails?.color && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-stone-400 font-medium">Color Preference</span>
                        <span className="text-sm text-stone-700">{inquiry.customDetails.color}</span>
                      </div>
                    )}
                    {inquiry.customDetails?.toppers && inquiry.customDetails.toppers.length > 0 && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-stone-400 font-medium shrink-0">Toppers</span>
                        <span className="text-sm text-stone-700 text-right max-w-[60%]">
                          {inquiry.customDetails.toppers.join(', ')}
                          {inquiry.customDetails.toyTopperDetail && <span className="block text-xs text-stone-500">Toy: {inquiry.customDetails.toyTopperDetail}</span>}
                          {inquiry.customDetails.fondantTopperDetail && <span className="block text-xs text-stone-500">Fondant: {inquiry.customDetails.fondantTopperDetail}</span>}
                          {inquiry.customDetails.toppersOther && <span className="block text-xs text-stone-500">Custom: {inquiry.customDetails.toppersOther}</span>}
                        </span>
                      </div>
                    )}
                    {inquiry.customDetails?.inspirationCake && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-stone-400 font-medium shrink-0">Inspired by</span>
                        <span className="text-sm text-stone-700 text-right max-w-[60%]">
                          {inquiry.customDetails.inspirationCake}
                          {inquiry.customDetails.inspirationElements && <span className="block text-xs text-stone-500">{inquiry.customDetails.inspirationElements}</span>}
                        </span>
                      </div>
                    )}
                  </div>
                  {inquiry.customDetails?.notes && (
                    <div className="bg-stone-50 rounded-xl px-4 py-3 mb-3">
                      <p className="text-xs text-stone-400 font-medium mb-1">Additional Notes</p>
                      <p className="text-sm text-stone-700 leading-relaxed">{inquiry.customDetails.notes}</p>
                    </div>
                  )}
                  {inquiry.customDetails?.referenceImage && (
                    <a
                      href={inquiry.customDetails.referenceImage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View Reference Image
                    </a>
                  )}
                </div>

                {/* Price Quote footer */}
                <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">Price Quote</p>
                    {inquiry.totalAmount > 0 ? (
                      <p className="text-xl font-bold text-stone-800">₱{inquiry.totalAmount.toLocaleString()}</p>
                    ) : (
                      <p className="text-sm text-stone-400 italic">Pending review by admin</p>
                    )}
                  </div>
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
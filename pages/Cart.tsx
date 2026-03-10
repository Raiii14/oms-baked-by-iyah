import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, ShoppingBag, History, Cake, ImageIcon, ChevronLeft, ChevronRight, Sparkles, Check, X, Upload, Calendar } from 'lucide-react';
import { Modal } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatTime, getMinDate } from '../utils/dateUtils';
import { UserRole, OrderStatus, PaymentMethod, DeliveryMethod } from '../types';
import { compressImage } from '../utils/imageCompression';

const CART_TABS = ['cart', 'history', 'custom'] as const;
type CartTab = typeof CART_TABS[number];

const Cart: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, user, orders, acceptInquiry, declineInquiry, addNotification } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: CartTab = (CART_TABS.includes(searchParams.get('tab') as CartTab)
    ? searchParams.get('tab') as CartTab
    : 'cart');
  const setActiveTab = (tab: CartTab) => setSearchParams({ tab }, { replace: true });
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const [historyPage, setHistoryPage] = useState(1);
  const [customPage, setCustomPage] = useState(1);

  // Redirect admins to dashboard
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const userOrders = useMemo(() =>
    user ? orders.filter(o => o.userId === user.id && !o.isCustomInquiry) : [],
    [orders, user]
  );
  const totalHistoryPages = Math.ceil(userOrders.length / ITEMS_PER_PAGE);
  const paginatedUserOrders = useMemo(
    () => userOrders.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE),
    [userOrders, historyPage]
  );
  const userInquiries = useMemo(() =>
    user ? orders.filter(o => o.userId === user.id && o.isCustomInquiry) : [],
    [orders, user]
  );
  const totalCustomPages = Math.ceil(userInquiries.length / ITEMS_PER_PAGE);
  const paginatedUserInquiries = useMemo(
    () => userInquiries.slice((customPage - 1) * ITEMS_PER_PAGE, customPage * ITEMS_PER_PAGE),
    [userInquiries, customPage]
  );

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

  // Accept/Decline state for custom inquiries
  const [acceptingInquiryId, setAcceptingInquiryId] = useState<string | null>(null);
  const [decliningInquiryId, setDecliningInquiryId] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [acceptPayment, setAcceptPayment] = useState<PaymentMethod>(PaymentMethod.COD);
  const [acceptDelivery, setAcceptDelivery] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptAddress, setAcceptAddress] = useState('');
  const [acceptProof, setAcceptProof] = useState<File | null>(null);

  const resetAcceptForm = () => {
    setAcceptingInquiryId(null);
    setAcceptPayment(PaymentMethod.COD);
    setAcceptDelivery(DeliveryMethod.PICKUP);
    setAcceptDate('');
    setAcceptAddress('');
    setAcceptProof(null);
  };

  const handleAcceptSubmit = async (inquiryId: string) => {
    if (!acceptDate) { addNotification('Please select a date.', 'error'); return; }
    if (acceptPayment === PaymentMethod.GCASH && !acceptProof) { addNotification('Please upload GCash receipt.', 'error'); return; }
    if (acceptDelivery === DeliveryMethod.DELIVERY && !acceptAddress.trim()) { addNotification('Please enter delivery address.', 'error'); return; }
    setIsAccepting(true);
    try {
      await acceptInquiry(inquiryId, {
        paymentMethod: acceptPayment,
        deliveryMethod: acceptDelivery,
        scheduledDate: acceptDate,
        paymentProof: acceptProof,
        deliveryAddress: acceptDelivery === DeliveryMethod.DELIVERY ? acceptAddress : undefined,
      });
      resetAcceptForm();
      addNotification('Order accepted! Your cake is being prepared.', 'success');
    } catch {
      addNotification('Failed to accept inquiry. Please try again.', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!decliningInquiryId) return;
    setIsDeclining(true);
    try {
      await declineInquiry(decliningInquiryId);
      setDecliningInquiryId(null);
      addNotification('Inquiry cancelled.', 'info');
    } catch {
      addNotification('Failed to cancel inquiry. Please try again.', 'error');
    } finally {
      setIsDeclining(false);
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
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-9 h-9 text-rose-300" />
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Your cart is empty</h2>
              <p className="text-stone-500 mb-8">Looks like you haven't added any sweets yet.</p>
              <button onClick={() => navigate('/menu')} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors text-sm shadow-sm hover:shadow-md">
                Browse Menu <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-rose-200 overflow-hidden flex gap-0 transition-all duration-200">
                    {/* Image */}
                    <div className="w-28 sm:w-32 h-28 sm:h-32 flex-shrink-0">
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
                        <p className="font-bold text-rose-600 text-base">₱{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 sticky top-24 overflow-hidden">
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-4">
                    <h3 className="font-bold text-white text-base">Order Summary</h3>
                    <p className="text-rose-100 text-xs mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
                  </div>
                  <div className="p-6">
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
                        <span className="text-rose-600">₱{subtotal.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">Delivery fees & taxes at checkout.</p>
                    </div>
                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full mt-5 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
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
          ) : userOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <History className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500">No past orders found.</p>
            </div>
          ) : (
            paginatedUserOrders.map((order) => (
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
          {user && userOrders.length > 0 && totalHistoryPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-sm font-medium">Page {historyPage} of {totalHistoryPages}</span>
              <button onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages} className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          {!user ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <Cake className="w-7 h-7 text-rose-300" />
              </div>
              <p className="text-stone-500 mb-5">Please login to view your custom cake inquiries.</p>
              <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors text-sm shadow-sm hover:shadow-md">Login Now</button>
            </div>
          ) : userInquiries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <Cake className="w-7 h-7 text-rose-300" />
              </div>
              <p className="text-stone-500 mb-1">No custom cake inquiries yet.</p>
              <p className="text-stone-400 text-sm mb-5">Design your dream cake and we'll make it happen.</p>
              <button onClick={() => navigate('/custom-cake')} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors text-sm shadow-sm hover:shadow-md"><Sparkles className="w-4 h-4" /> Request a Quote</button>
            </div>
          ) : (
            paginatedUserInquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

                {/* Card Header */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                        <Cake className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold font-mono tracking-wide text-white/80">{inquiry.id}</span>
                    </div>
                    <StatusBadge status={inquiry.status} className="self-start sm:self-auto" />
                  </div>
                </div>

                {/* Meta */}
                <div className="px-5 py-3 flex flex-wrap items-center gap-2 bg-stone-50 border-b border-stone-100">
                  <span className="bg-white border border-stone-200 text-stone-500 text-xs px-2.5 py-1 rounded-full">Submitted: {new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">Needed: {new Date(inquiry.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Cake Details */}
                <div className="divide-y divide-stone-100 px-5">
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-stone-500 font-medium min-w-[100px]">Size</span>
                    <span className="text-sm font-medium text-stone-800">{inquiry.customDetails?.size || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-stone-500 font-medium min-w-[100px]">Date Needed</span>
                    <span className="text-sm font-medium text-stone-800">{new Date(inquiry.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {inquiry.customDetails?.flavor && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-stone-500 font-medium min-w-[100px]">Flavor</span>
                      <span className="text-sm font-medium text-stone-800">{inquiry.customDetails.flavor}</span>
                    </div>
                  )}
                  {inquiry.customDetails?.servings && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-stone-500 font-medium min-w-[100px]">Servings</span>
                      <span className="text-sm font-medium text-stone-800">{inquiry.customDetails.servings}</span>
                    </div>
                  )}
                  {inquiry.customDetails?.color && (
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-stone-500 font-medium min-w-[100px]">Color</span>
                      <span className="text-sm font-medium text-stone-800">{inquiry.customDetails.color}</span>
                    </div>
                  )}
                  {inquiry.customDetails?.inspirationCake && (
                    <div className="flex justify-between items-start gap-4 py-2.5">
                      <span className="text-sm text-stone-500 font-medium shrink-0">Inspired by</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-stone-800">{inquiry.customDetails.inspirationCake}</p>
                        {inquiry.customDetails.inspirationElements && <p className="text-xs text-stone-500 mt-0.5">{inquiry.customDetails.inspirationElements}</p>}
                      </div>
                    </div>
                  )}
                  {inquiry.customDetails?.toppers && inquiry.customDetails.toppers.length > 0 && (
                    <div className="py-3">
                      <span className="text-sm text-stone-500 font-medium">Toppers</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {inquiry.customDetails.toppers.map(t => (
                          <span key={t} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">{t}</span>
                        ))}
                      </div>
                      {(inquiry.customDetails.toyTopperDetail || inquiry.customDetails.fondantTopperDetail || inquiry.customDetails.toppersOther) && (
                        <div className="mt-1.5 space-y-0.5">
                          {inquiry.customDetails.toyTopperDetail && <p className="text-xs text-stone-500">Toy: {inquiry.customDetails.toyTopperDetail}</p>}
                          {inquiry.customDetails.fondantTopperDetail && <p className="text-xs text-stone-500">Fondant: {inquiry.customDetails.fondantTopperDetail}</p>}
                          {inquiry.customDetails.toppersOther && <p className="text-xs text-stone-500">Custom: {inquiry.customDetails.toppersOther}</p>}
                        </div>
                      )}
                    </div>
                  )}
                  {inquiry.customDetails?.cakeMessage && (
                    <div className="py-3">
                      <span className="text-sm text-stone-500 font-medium">Message on Cake</span>
                      <p className="mt-1.5 text-sm text-stone-700 italic border-l-2 border-rose-200 pl-3">&ldquo;{inquiry.customDetails.cakeMessage}&rdquo;</p>
                    </div>
                  )}
                  {inquiry.customDetails?.notes && (
                    <div className="py-3">
                      <span className="text-sm text-stone-500 font-medium">Notes</span>
                      <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{inquiry.customDetails.notes}</p>
                    </div>
                  )}
                  {inquiry.customDetails?.referenceImage && (
                    <div className="py-3">
                      <a
                        href={inquiry.customDetails.referenceImage}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Reference Image
                      </a>
                    </div>
                  )}
                </div>

                {/* Price Quote footer */}
                {inquiry.totalAmount > 0 && inquiry.status === OrderStatus.PENDING ? (
                  <>
                    <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-0.5">Price Quote</p>
                          <p className="text-2xl font-bold text-rose-600">₱{inquiry.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAcceptingInquiryId(acceptingInquiryId === inquiry.id ? null : inquiry.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          <button
                            onClick={() => setDecliningInquiryId(inquiry.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-700 text-sm font-semibold rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>

                      {/* Inline Accept Checkout Form */}
                      {acceptingInquiryId === inquiry.id && (
                        <div className="mt-3 pt-4 border-t border-rose-200 space-y-4">
                          {/* Schedule */}
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Pickup / Delivery Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                              <input type="date" value={acceptDate} onChange={e => setAcceptDate(e.target.value)} min={getMinDate()} className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none text-sm" />
                            </div>
                          </div>
                          {/* Delivery Method */}
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Method</label>
                            <div className="flex gap-3">
                              {[DeliveryMethod.PICKUP, DeliveryMethod.DELIVERY].map(m => (
                                <label key={m} className={`flex-1 flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${acceptDelivery === m ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-stone-200 hover:border-stone-300'}`}>
                                  <input type="radio" name={`delivery-${inquiry.id}`} value={m} checked={acceptDelivery === m} onChange={() => setAcceptDelivery(m)} className="sr-only" />
                                  {m}
                                </label>
                              ))}
                            </div>
                            {acceptDelivery === DeliveryMethod.DELIVERY && (
                              <textarea value={acceptAddress} onChange={e => setAcceptAddress(e.target.value)} placeholder="Complete delivery address" rows={2} className="w-full mt-2 p-2.5 border border-stone-300 rounded-lg text-sm outline-none focus:ring-rose-500 focus:border-rose-500" />
                            )}
                          </div>
                          {/* Payment Method */}
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Payment</label>
                            <div className="flex gap-3">
                              {[PaymentMethod.COD, PaymentMethod.GCASH].map(m => (
                                <label key={m} className={`flex-1 flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${acceptPayment === m ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-stone-200 hover:border-stone-300'}`}>
                                  <input type="radio" name={`payment-${inquiry.id}`} value={m} checked={acceptPayment === m} onChange={() => setAcceptPayment(m)} className="sr-only" />
                                  {m === PaymentMethod.COD && acceptDelivery === DeliveryMethod.PICKUP ? 'Cash on Pickup' : m}
                                </label>
                              ))}
                            </div>
                            {acceptPayment === PaymentMethod.GCASH && (
                              <div className="mt-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                                <p className="text-sm font-medium text-stone-700 mb-2">Send ₱{inquiry.totalAmount.toLocaleString()} to 09XX-XXX-XXXX (Iyah)</p>
                                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-rose-400 transition-colors">
                                  <Upload className="w-4 h-4 text-stone-400" />
                                  <span className="text-sm text-stone-500">{acceptProof ? acceptProof.name : 'Upload receipt'}</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) { const c = await compressImage(f); setAcceptProof(c); } }} />
                                </label>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button disabled={isAccepting} onClick={() => handleAcceptSubmit(inquiry.id)} className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                              {isAccepting ? 'Confirming…' : 'Confirm Order'}
                            </button>
                            <button onClick={resetAcceptForm} className="px-4 py-2.5 bg-stone-100 text-stone-600 font-medium rounded-lg hover:bg-stone-200 transition-colors text-sm">
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : inquiry.totalAmount > 0 ? (
                  <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-0.5">Price Quote</p>
                      <p className="text-2xl font-bold text-rose-600">₱{inquiry.totalAmount.toLocaleString()}</p>
                    </div>
                    <StatusBadge status={inquiry.status} />
                  </div>
                ) : (
                  <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-sm text-stone-500 italic">Awaiting price quote from admin</p>
                  </div>
                )}

              </div>
            ))
          )}
          {user && userInquiries.length > 0 && totalCustomPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button onClick={() => setCustomPage(p => Math.max(1, p - 1))} disabled={customPage === 1} className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-sm font-medium">Page {customPage} of {totalCustomPages}</span>
              <button onClick={() => setCustomPage(p => Math.min(totalCustomPages, p + 1))} disabled={customPage === totalCustomPages} className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      )}

      {/* Decline confirmation modal */}
      <Modal
        isOpen={!!decliningInquiryId}
        onClose={() => setDecliningInquiryId(null)}
        type="warning"
        title="Cancel Custom Cake Order?"
        message="Are you sure you want to cancel this inquiry? This action cannot be undone."
        primaryAction={{ label: isDeclining ? 'Cancelling…' : 'Yes, Cancel', onClick: handleDeclineConfirm, disabled: isDeclining }}
        secondaryAction={{ label: 'Go Back', onClick: () => setDecliningInquiryId(null) }}
      />
    </div>
  );
};

export default Cart;
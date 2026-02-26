import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { DeliveryMethod, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';

const Checkout: React.FC = () => {
  const { cart, placeOrder, user, addNotification } = useStore();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    if (!user) {
      addNotification("Please login to proceed to checkout.", "error");
      navigate('/login');
    } else if (cart.length === 0 && !isOrderPlaced) {
      navigate('/cart');
    }
  }, [user, cart, navigate, addNotification, isOrderPlaced]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === DeliveryMethod.DELIVERY ? 50 : 0;
  const total = subtotal + deliveryFee;

  // Calculate minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format to YYYY-MM-DD using local time to avoid UTC issues
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === PaymentMethod.GCASH && !paymentProof) {
      addNotification("Please upload the GCash receipt.", "error");
      return;
    }

    placeOrder({
      paymentMethod,
      deliveryMethod,
      scheduledDate,
      scheduledTime,
      paymentProof
    });
    setIsOrderPlaced(true);
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/cart');
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        type="success"
        title="Order Placed Successfully!"
        message="Thank you for your order. We have received it and will start processing it soon. You can track your order in your profile."
        primaryAction={{
          label: 'Back to Cart',
          onClick: handleModalClose
        }}
      />
      <button onClick={() => navigate('/cart')} className="flex items-center text-stone-500 hover:text-rose-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2 space-y-6">
          <form id="checkout-form" onSubmit={handleCheckout} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6">
            
            {/* Scheduling */}
            <div>
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input 
                      type="date" 
                      required 
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={getMinDate()}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Orders must be placed at least 1 day in advance.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                    <input
                      type="time"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      min="08:00"
                      max="19:00"
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Operating hours: 8:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Method</h3>
              <div className="flex gap-4">
                {[DeliveryMethod.PICKUP, DeliveryMethod.DELIVERY].map((method) => (
                  <label key={method} className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${deliveryMethod === method ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input 
                      type="radio" 
                      name="delivery" 
                      value={method} 
                      checked={deliveryMethod === method}
                      onChange={() => setDeliveryMethod(method)}
                      className="sr-only"
                    />
                    <span className="font-medium">{method}</span>
                  </label>
                ))}
              </div>
              {deliveryMethod === DeliveryMethod.DELIVERY && (
                 <p className="text-xs text-stone-500 mt-2">Available within Obando and Valenzuela only.</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold text-stone-800 mb-3">Payment</h3>
              <div className="flex gap-4 mb-4">
                {[PaymentMethod.COD, PaymentMethod.GCASH].map((method) => (
                  <label key={method} className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === method ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value={method} 
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="sr-only"
                    />
                    <span className="font-medium">
                      {method === PaymentMethod.COD && deliveryMethod === DeliveryMethod.PICKUP 
                        ? 'Cash on Pickup' 
                        : method}
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === PaymentMethod.GCASH && (
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                  <p className="text-sm font-medium mb-2">Send ₱{total} to 09XX-XXX-XXXX (Iyah)</p>
                  <label className="block">
                    <span className="text-xs text-stone-500">Upload Screenshot</span>
                    <div className="mt-1 flex items-center gap-2">
                       <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                       />
                    </div>
                  </label>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 sticky top-24">
            <h3 className="font-bold text-stone-800 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.quantity}x {item.name}</span>
                  <span className="font-medium">₱{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₱{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span>₱{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span>₱{total}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              className="w-full mt-6 py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-md hover:shadow-lg transition-all"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

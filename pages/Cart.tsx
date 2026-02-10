import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Calendar, Clock, CreditCard, Upload } from 'lucide-react';
import { DeliveryMethod, PaymentMethod } from '../types';

const Cart: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, placeOrder, user } = useStore();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.PICKUP);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === DeliveryMethod.DELIVERY ? 50 : 0; // Flat rate for demo
  const total = subtotal + deliveryFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to place an order.");
      navigate('/login');
      return;
    }
    if (paymentMethod === PaymentMethod.GCASH && !paymentProof) {
      alert("Please upload the GCash receipt.");
      return;
    }

    placeOrder({
      paymentMethod,
      deliveryMethod,
      scheduledDate,
      scheduledTime,
      paymentProof
    });
    navigate('/');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Your cart is empty</h2>
        <p className="text-stone-500 mb-8">Looks like you haven't added any sweets yet.</p>
        <button onClick={() => navigate('/menu')} className="text-rose-500 font-medium hover:text-rose-600">
          Go to Menu &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Cart Items */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-stone-800">Order Summary</h2>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          {cart.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 border-b border-stone-100 last:border-0">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-stone-800">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-stone-500 text-sm">₱{item.price}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
          <div className="flex justify-between mb-2 text-stone-600">
            <span>Subtotal</span>
            <span>₱{subtotal}</span>
          </div>
          <div className="flex justify-between mb-2 text-stone-600">
            <span>Delivery Fee</span>
            <span>₱{deliveryFee}</span>
          </div>
          <div className="border-t border-stone-100 pt-2 mt-2 flex justify-between font-bold text-lg text-stone-900">
            <span>Total</span>
            <span>₱{total}</span>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-6">Checkout Details</h2>
        <form onSubmit={handleCheckout} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6">
          
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
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <select
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
                  >
                    <option value="">Select Time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
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
                  <span className="font-medium">{method}</span>
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

          <button 
            type="submit" 
            className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-md hover:shadow-lg transition-all"
          >
            Place Order (₱{total})
          </button>
        </form>
      </div>
    </div>
  );
};

export default Cart;
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderStatus, PaymentMethod } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Package, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { orders, products, ingredients, updateOrderStatus, updateInventory } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'reports'>('orders');

  // Reports Data
  const totalRevenue = orders
    .filter(o => o.status !== OrderStatus.CANCELLED)
    .reduce((acc, o) => acc + o.totalAmount, 0);
  
  const productSales = products.map(p => {
    const quantitySold = orders.reduce((acc, o) => {
        const item = o.items.find(i => i.id === p.id);
        return acc + (item ? item.quantity : 0);
    }, 0);
    return { name: p.name, sales: quantitySold };
  }).sort((a,b) => b.sales - a.sales);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-stone-200">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
           {orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => (
             <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
               <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-stone-100 pb-4">
                 <div>
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-lg">{order.id}</span>
                     {order.isCustomInquiry && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">Inquiry</span>}
                   </div>
                   <p className="text-stone-500 text-sm">Customer: <span className="font-medium text-stone-800">{order.customerName}</span></p>
                   <p className="text-stone-500 text-sm">Date: {order.scheduledDate} at {order.scheduledTime}</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-bold text-lg">₱{order.totalAmount}</p>
                        <p className="text-xs text-stone-500">{order.paymentMethod}</p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`px-3 py-1 rounded-full text-sm font-bold border-none outline-none cursor-pointer ${
                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                        order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                        'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
               </div>

               {/* Items or Custom Details */}
               {order.isCustomInquiry ? (
                 <div className="bg-purple-50 p-4 rounded-lg">
                    <p><strong>Size:</strong> {order.customDetails?.size}</p>
                    <p><strong>Notes:</strong> {order.customDetails?.notes}</p>
                    {order.customDetails?.referenceImage && (
                        <div className="mt-2">
                             <a href={order.customDetails.referenceImage} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm">View Reference Image</a>
                        </div>
                    )}
                 </div>
               ) : (
                 <ul className="space-y-2">
                   {order.items.map(item => (
                     <li key={item.id} className="flex justify-between text-sm">
                       <span>{item.quantity}x {item.name}</span>
                       <span className="text-stone-500">₱{item.price * item.quantity}</span>
                     </li>
                   ))}
                 </ul>
               )}

               {/* Payment Proof */}
               {order.paymentMethod === PaymentMethod.GCASH && order.paymentProof && (
                 <div className="mt-4 pt-4 border-t border-stone-100">
                   <p className="text-xs font-bold text-stone-500 mb-1">Payment Receipt:</p>
                   <a href={order.paymentProof} target="_blank" rel="noreferrer" className="text-rose-500 hover:underline text-sm flex items-center gap-1">
                     View Receipt
                   </a>
                 </div>
               )}
             </div>
           ))}
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Finished Goods */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-500" /> Finished Goods
            </h3>
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 hover:bg-stone-50 rounded">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-stone-500">Price: ₱{product.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateInventory(product.id, 'product', Math.max(0, product.stock - 1))} className="w-6 h-6 bg-stone-100 rounded hover:bg-stone-200">-</button>
                    <span className={`w-8 text-center font-medium ${product.stock === 0 ? 'text-red-500' : ''}`}>{product.stock}</span>
                    <button onClick={() => updateInventory(product.id, 'product', product.stock + 1)} className="w-6 h-6 bg-stone-100 rounded hover:bg-stone-200">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Materials */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" /> Raw Materials
            </h3>
            <div className="space-y-4">
              {ingredients.map(ing => (
                <div key={ing.id} className="flex justify-between items-center p-2 hover:bg-stone-50 rounded">
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{ing.name}</p>
                        {ing.quantity <= ing.threshold && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-xs text-stone-500">Unit: {ing.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateInventory(ing.id, 'ingredient', Math.max(0, ing.quantity - 1))} className="w-6 h-6 bg-stone-100 rounded hover:bg-stone-200">-</button>
                    <span className={`w-12 text-center font-medium ${ing.quantity <= ing.threshold ? 'text-red-500 font-bold' : ''}`}>{ing.quantity}</span>
                    <button onClick={() => updateInventory(ing.id, 'ingredient', ing.quantity + 1)} className="w-6 h-6 bg-stone-100 rounded hover:bg-stone-200">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-6 rounded-xl shadow-md">
                    <p className="text-rose-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold mt-1">₱{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-stone-800 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 text-sm font-medium">Active Inquiries</p>
                    <p className="text-3xl font-bold text-stone-800 mt-1">{orders.filter(o => o.isCustomInquiry && o.status === OrderStatus.PENDING).length}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-96">
                <h3 className="text-lg font-bold text-stone-800 mb-6">Best Selling Products</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productSales}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Legend />
                        <Bar dataKey="sales" name="Units Sold" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
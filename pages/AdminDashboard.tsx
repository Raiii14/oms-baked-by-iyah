import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderStatus, PaymentMethod } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Cake, Filter, ChevronLeft, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { orders, products, ingredients, updateOrderStatus, updateInventory, updateInquiryPrice } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries' | 'inventory' | 'reports'>('orders');
  const [showRawMaterials, setShowRawMaterials] = useState(true);

  // Orders Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Date sort

  // Filter Orders (excluding inquiries)
  const filteredOrders = orders
    .filter(o => !o.isCustomInquiry)
    .filter(o => filterStatus === 'all' || o.status === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDate + ' ' + a.scheduledTime).getTime();
      const dateB = new Date(b.scheduledDate + ' ' + b.scheduledTime).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Inquiries
  const inquiries = orders.filter(o => o.isCustomInquiry);

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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-stone-200 overflow-x-auto">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inquiries', label: 'Inquiries', icon: Cake },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-500" />
                    <span className="text-sm font-medium text-stone-700">Status:</span>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="border border-stone-300 rounded-md text-sm px-2 py-1"
                    >
                        <option value="all">All</option>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-700">Sort Date:</span>
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="border border-stone-300 rounded-md text-sm px-2 py-1"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>
            <div className="text-sm text-stone-500">
                Showing {filteredOrders.length} orders
            </div>
          </div>

           {paginatedOrders.length === 0 ? <p className="text-center py-8 text-stone-500">No orders found matching filters.</p> : paginatedOrders.map(order => (
             <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
               <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-stone-100 pb-4">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-lg text-stone-800">{order.customerName}</span>
                   </div>
                   <p className="text-stone-500 text-sm">{order.customerEmail || 'No email provided'}</p>
                   <p className="text-stone-500 text-sm mt-1">
                     <span className="font-medium">Date:</span> {new Date(order.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                   </p>
                   <p className="text-stone-500 text-sm">
                     <span className="font-medium">Time:</span> {order.scheduledTime}
                   </p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-bold text-lg">₱{order.totalAmount}</p>
                        <p className="text-xs text-stone-500">{order.paymentMethod}</p>
                    </div>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-bold border-none outline-none cursor-pointer transition-colors ${
                          order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                          order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          order.status === OrderStatus.BAKING ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                          'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                 </div>
               </div>

               <ul className="space-y-2">
                 {order.items.map(item => (
                   <li key={item.id} className="flex justify-between text-sm">
                     <span>{item.quantity}x {item.name}</span>
                     <span className="text-stone-500">₱{item.price * item.quantity}</span>
                   </li>
                 ))}
               </ul>

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

           {/* Pagination Controls */}
           {totalPages > 1 && (
               <div className="flex justify-center items-center gap-4 mt-8">
                   <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-50"
                   >
                       <ChevronLeft className="w-5 h-5" />
                   </button>
                   <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                   <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-50"
                   >
                       <ChevronRight className="w-5 h-5" />
                   </button>
               </div>
           )}
        </div>
      )}

      {/* CUSTOM INQUIRIES TAB */}
      {activeTab === 'inquiries' && (
          <div className="space-y-4">
              {inquiries.length === 0 ? <p className="text-center py-8 text-stone-500">No custom cake inquiries yet.</p> : inquiries.map(inquiry => (
                  <div key={inquiry.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="font-bold text-lg text-stone-800">{inquiry.customerName}</h3>
                              <p className="text-sm text-stone-500">{inquiry.customerEmail || 'No email provided'}</p>
                              <p className="text-sm text-stone-500 mt-1">
                                <span className="font-medium">Submitted:</span> {new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="relative">
                              <select
                                value={inquiry.status}
                                onChange={(e) => updateOrderStatus(inquiry.id, e.target.value as OrderStatus)}
                                className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-xs font-bold border-none outline-none cursor-pointer transition-colors ${
                                  inquiry.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                  inquiry.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                  inquiry.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                  inquiry.status === OrderStatus.BAKING ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                  'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                }`}
                              >
                                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                              </div>
                            </div>
                          </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg mb-4">
                        <p><strong>Size:</strong> {inquiry.customDetails?.size}</p>
                        <p><strong>Notes:</strong> {inquiry.customDetails?.notes}</p>
                        <p><strong>Date Needed:</strong> {new Date(inquiry.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        {inquiry.customDetails?.referenceImage && (
                            <div className="mt-2">
                                    <a href={inquiry.customDetails.referenceImage} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm">View Reference Image</a>
                            </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200">
                          <label className="text-sm font-bold text-stone-700">Set Price Quote:</label>
                          <div className="flex items-center gap-2">
                              <span className="text-stone-500 font-bold">₱</span>
                              <input 
                                type="number" 
                                defaultValue={inquiry.totalAmount}
                                onBlur={(e) => updateInquiryPrice(inquiry.id, parseFloat(e.target.value))}
                                className="w-32 border border-stone-300 rounded px-2 py-1"
                                placeholder="0.00"
                              />
                              <button className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded hover:bg-stone-700">
                                  Update
                              </button>
                          </div>
                          <span className="text-xs text-stone-500 ml-2">
                              (Updates automatically on blur or enter)
                          </span>
                      </div>
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
                    <input 
                        type="number" 
                        value={product.stock}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 0 && val <= 500) {
                                updateInventory(product.id, 'product', val);
                            }
                        }}
                        className="w-20 border border-stone-300 rounded px-2 py-1 text-center"
                        min="0"
                        max="500"
                    />
                    <span className="text-xs text-stone-400">/ 500</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Materials */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" /> Raw Materials
                </h3>
                <button 
                    onClick={() => setShowRawMaterials(!showRawMaterials)}
                    className="text-stone-500 hover:text-stone-700"
                >
                    {showRawMaterials ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
            </div>
            
            {showRawMaterials && (
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
            )}
            {!showRawMaterials && <p className="text-sm text-stone-400 italic">Raw materials section hidden.</p>}
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
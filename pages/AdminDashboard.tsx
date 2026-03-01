import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { OrderStatus, PaymentMethod, ProductCategory, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, LabelList } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Cake, Filter, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

type AdminTab = 'orders' | 'inquiries' | 'inventory' | 'reports' | 'menu';
const VALID_TABS: AdminTab[] = ['orders', 'inquiries', 'inventory', 'reports', 'menu'];

// Converts "HH:MM" 24-hr to "H:MM AM/PM"
const formatTime = (t: string): string => {
  if (!t || t === 'TBD') return t;
  if (/AM|PM/i.test(t)) return t;
  const [hStr, mStr = '00'] = t.split(':');
  let h = parseInt(hStr, 10);
  const meridiem = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${meridiem}`;
};

const AdminDashboard: React.FC = () => {
  const { orders, products, updateOrderStatus, updateInventory, updateInquiryPrice, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: AdminTab = (VALID_TABS.includes(searchParams.get('tab') as AdminTab)
    ? searchParams.get('tab') as AdminTab
    : 'orders');
  const setActiveTab = (tab: AdminTab) => setSearchParams({ tab }, { replace: true });
  const [reportTimeframe, setReportTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  // Local price input state per inquiry — only sent to DB on "Update" click
  const [inquiryPriceInputs, setInquiryPriceInputs] = useState<Record<string, string>>({});

  // Local string draft state for inventory inputs so the field can be fully cleared while typing
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const getStockDisplay = (productId: string, stock: number) =>
    productId in stockDrafts ? stockDrafts[productId] : String(stock);

  // State for full product editing and deletion
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Converts any Google Drive sharing/view URL into a direct-embeddable thumbnail URL.
  // Also accepts already-direct URLs untouched.
  const normalizeImageUrl = (url: string): string => {
    const trimmed = url.trim();
    const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
    const ucMatch   = trimmed.match(/[?&]id=([^&]+)/);
    const id = fileMatch?.[1] ?? (trimmed.includes('drive.google.com') ? ucMatch?.[1] : undefined);
    if (id) {
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return trimmed;
  };

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
  const validOrders = React.useMemo(() => orders.filter(o => o.status !== OrderStatus.CANCELLED), [orders]);
  
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const needsPriceQuote = orders.filter(o => o.isCustomInquiry && (!o.totalAmount || o.totalAmount === 0)).length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  
  // Calculate Sales by Product (Iterating ORDERS to catch everything, including Custom Cakes)
  const salesMap = new Map<string, number>();
  
  validOrders.forEach(order => {
    if (order.isCustomInquiry) {
        // Group all custom cakes together
        const current = salesMap.get('Custom Cakes') || 0;
        salesMap.set('Custom Cakes', current + 1);
    } else {
        order.items.forEach(item => {
            const current = salesMap.get(item.name) || 0;
            salesMap.set(item.name, current + item.quantity);
        });
    }
  });

  const productSales = Array.from(salesMap.entries())
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales);

  // Revenue Over Time Data
  const revenueData = React.useMemo(() => {
    const dataMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 7 days or 12 months with 0
    if (reportTimeframe === 'weekly') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
            dataMap.set(key, 0);
        }
    } else {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString('en-US', { month: 'short' }); // Jan, Feb
            dataMap.set(key, 0);
        }
    }

    validOrders.forEach(order => {
        const date = new Date(order.createdAt); // Use createdAt for reporting
        let key = '';
        
        if (reportTimeframe === 'weekly') {
            // Check if within last 7 days
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays <= 7) {
                key = date.toLocaleDateString('en-US', { weekday: 'short' });
            }
        } else {
            // Check if within last 12 months
            const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
            if (diffMonths <= 12) {
                key = date.toLocaleDateString('en-US', { month: 'short' });
            }
        }

        if (key && dataMap.has(key)) {
            dataMap.set(key, (dataMap.get(key) || 0) + order.totalAmount);
        }
    });

    return Array.from(dataMap.entries()).map(([name, revenue]) => ({ name, revenue }));
  }, [validOrders, reportTimeframe]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-stone-200 overflow-x-auto">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inquiries', label: 'Inquiries', icon: Cake },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'menu', label: 'Menu', icon: Plus },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Filter by Status</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="w-full border border-stone-200 rounded-lg text-sm pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-rose-400 bg-stone-50 appearance-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Sort by Date</label>
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full border border-stone-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-rose-400 bg-stone-50 appearance-none cursor-pointer"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">{filteredOrders.length === 0 ? 'No orders found' : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`}</span>
                {filterStatus !== 'all' && (
                    <button onClick={() => { setFilterStatus('all'); setCurrentPage(1); }} className="text-xs text-rose-500 hover:text-rose-700 font-medium">Clear filter</button>
                )}
            </div>
          </div>

           {paginatedOrders.length === 0 ? (
             <div className="text-center py-16">
               <ShoppingBag className="w-12 h-12 text-stone-200 mx-auto mb-3" />
               <p className="text-stone-400 font-medium">No orders found matching filters.</p>
             </div>
           ) : paginatedOrders.map(order => (
             <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

               {/* Card Header */}
               <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/60">
                 <div className="flex items-start gap-3 min-w-0">
                   <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                     <ShoppingBag className="w-4 h-4 text-rose-500" />
                   </div>
                   <div className="min-w-0">
                     <h3 className="font-bold text-stone-800 text-base leading-tight">{order.customerName}</h3>
                     <span className="inline-block mt-1 text-xs font-bold font-mono tracking-wide bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">{order.id}</span>
                   </div>
                 </div>
                 <div className="relative flex-shrink-0">
                   <select
                     value={order.status}
                     onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                     className={`appearance-none pl-3 pr-6 py-1.5 rounded-full text-xs font-bold border-none outline-none cursor-pointer transition-colors ${
                       order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                       order.status === OrderStatus.PENDING   ? 'bg-amber-100 text-amber-700' :
                       order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                       order.status === OrderStatus.BAKING    ? 'bg-orange-100 text-orange-700' :
                       'bg-stone-100 text-stone-600'
                     }`}
                   >
                     {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                     <svg className="fill-current h-3 w-3 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                   </div>
                 </div>
               </div>

               {/* Customer Meta */}
               <div className="px-6 py-3 flex flex-wrap items-center gap-2 border-b border-stone-100">
                 <span className="bg-stone-100 text-stone-600 text-xs font-medium px-2.5 py-1 rounded-full">{order.customerEmail || 'No email provided'}</span>
                 <span className="bg-stone-100 text-stone-500 text-xs px-2.5 py-1 rounded-full">Ordered: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                 <span className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-100">📅 Needed: {new Date(order.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(order.scheduledTime)}</span>
                 {order.paymentMethod && <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-100">{order.paymentMethod}</span>}
               </div>

               {/* Order Items */}
               <div className="px-6 py-5">
                 <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Order Items</p>
                 <ul className="space-y-2">
                   {order.items.map(item => (
                     <li key={item.id} className="flex justify-between items-center text-sm">
                       <span className="text-stone-700">{item.quantity}× {item.name}</span>
                       <span className="font-medium text-stone-600">₱{(item.price * item.quantity).toLocaleString()}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               {/* Total & Payment Footer */}
               <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                   <div>
                     <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Total Amount</p>
                     <p className="text-2xl font-bold text-stone-800">₱{order.totalAmount.toLocaleString()}</p>
                     <p className="text-xs text-stone-400 mt-0.5">{order.paymentMethod}</p>
                   </div>
                   {order.paymentMethod === PaymentMethod.GCASH && order.paymentProof && (
                     <a
                       href={order.paymentProof}
                       target="_blank"
                       rel="noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
                     >
                       <ImageIcon className="w-4 h-4" />
                       View Payment Receipt
                     </a>
                   )}
                 </div>
               </div>

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
          {inquiries.length === 0 ? (
            <div className="text-center py-16">
              <Cake className="w-12 h-12 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 font-medium">No custom cake inquiries yet.</p>
            </div>
          ) : inquiries.map(inquiry => {
            const priceInput = inquiryPriceInputs[inquiry.id] ?? String(inquiry.totalAmount || '');
            return (
              <div key={inquiry.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/60">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Cake className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-stone-800 text-base leading-tight">{inquiry.customerName}</h3>
                      <span className="inline-block mt-1 text-xs font-bold font-mono tracking-wide bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">{inquiry.id}</span>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateOrderStatus(inquiry.id, e.target.value as OrderStatus)}
                      className={`appearance-none pl-3 pr-6 py-1.5 rounded-full text-xs font-bold border-none outline-none cursor-pointer transition-colors ${
                        inquiry.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                        inquiry.status === OrderStatus.PENDING   ? 'bg-amber-100 text-amber-700' :
                        inquiry.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-700' :
                        inquiry.status === OrderStatus.BAKING    ? 'bg-orange-100 text-orange-700' :
                        'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                      <svg className="fill-current h-3 w-3 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Customer Meta */}
                <div className="px-6 py-3 flex flex-wrap items-center gap-2 border-b border-stone-100">
                  <span className="bg-stone-100 text-stone-500 text-xs px-2.5 py-1 rounded-full">{inquiry.customerEmail || 'No email provided'}</span>
                  <span className="bg-stone-100 text-stone-500 text-xs px-2.5 py-1 rounded-full">Submitted: {new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Cake Details */}
                <div className="px-6 py-5">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Cake Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-violet-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-violet-400 font-medium mb-0.5">Size</p>
                      <p className="text-sm font-semibold text-violet-800">{inquiry.customDetails?.size || '—'}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-500 font-medium mb-0.5">Date Needed</p>
                      <p className="text-sm font-semibold text-amber-800">{new Date(inquiry.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {inquiry.customDetails?.notes && (
                    <div className="bg-stone-50 rounded-xl px-4 py-3 mb-3">
                      <p className="text-xs text-stone-400 font-medium mb-1">Notes from Customer</p>
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

                {/* Price Quote */}
                <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Price Quote</p>
                      <p className="text-2xl font-bold text-stone-800">
                        {inquiry.totalAmount > 0 ? `₱${inquiry.totalAmount.toLocaleString()}` : <span className="text-stone-300">Not set yet</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <span className="pl-3 pr-1 text-stone-400 font-bold text-sm">₱</span>
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setInquiryPriceInputs(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                          className="w-28 px-2 py-2 outline-none text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0.00"
                          min="0"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const val = parseFloat(priceInput);
                          if (!isNaN(val) && val >= 0) {
                            updateInquiryPrice(inquiry.id, val);
                          }
                        }}
                        className="px-4 py-2 bg-stone-800 text-white text-sm font-semibold rounded-lg hover:bg-stone-700 active:scale-95 transition-all whitespace-nowrap"
                      >
                        Set Price
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="max-w-4xl mx-auto">
          {/* Finished Goods */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-rose-500" /> Finished Goods Inventory
                </h3>
                <button 
                    onClick={() => setActiveTab('menu')}
                    className="text-sm bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="bg-stone-50 border border-stone-100 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  {/* Product info row */}
                  <div className="flex items-center gap-4 px-4 pt-4 pb-3">
                    <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-stone-800 text-base">{product.name}</p>
                      <p className="text-sm text-stone-500 mt-0.5">₱{product.price.toLocaleString()}</p>
                      {product.stock <= 5 && (
                        <span className="inline-block text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full mt-1.5 border border-red-100">⚠ Low Stock</span>
                      )}
                    </div>
                  </div>
                  {/* Stock control row */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-white">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Stock Quantity</span>
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                        <button 
                            onClick={() => {
                                const val = Math.max(0, product.stock - 1);
                                updateInventory(product.id, 'product', val);
                            }}
                            className="w-10 h-9 flex items-center justify-center bg-stone-50 hover:bg-stone-100 text-stone-600 border-r border-stone-200 font-bold text-lg"
                        >
                            −
                        </button>
                        <input 
                            type="number"
                            value={getStockDisplay(product.id, product.stock)}
                            onChange={(e) => {
                                const raw = e.target.value;
                                setStockDrafts(d => ({ ...d, [product.id]: raw }));
                                const val = parseInt(raw, 10);
                                if (!isNaN(val) && val >= 0) {
                                    updateInventory(product.id, 'product', val);
                                }
                            }}
                            onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                const safe = isNaN(val) || val < 0 ? 0 : val;
                                updateInventory(product.id, 'product', safe);
                                setStockDrafts(d => { const n = { ...d }; delete n[product.id]; return n; });
                            }}
                            className="w-16 text-center h-9 outline-none text-sm font-bold text-stone-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                        />
                        <button 
                            onClick={() => {
                                const val = product.stock + 1;
                                updateInventory(product.id, 'product', val);
                            }}
                            className="w-10 h-9 flex items-center justify-center bg-stone-50 hover:bg-stone-100 text-stone-600 border-l border-stone-200 font-bold text-lg"
                        >
                            +
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MENU MANAGEMENT TAB */}
      {activeTab === 'menu' && (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-8">
                <h3 className="text-lg font-bold text-stone-800 mb-4">
                    Add New Product
                </h3>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        let imageUrl = (formData.get('imageUrl') as string).trim();

                        if (!imageUrl) {
                            imageUrl = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                        } else {
                            imageUrl = normalizeImageUrl(imageUrl);
                        }

                        const newProduct: Product = {
                            id: `p${Date.now()}`,
                            name: formData.get('name') as string,
                            description: formData.get('description') as string,
                            price: Number(formData.get('price')),
                            category: formData.get('category') as ProductCategory,
                            image: imageUrl,
                            stock: Number(formData.get('stock'))
                        };
                        addProduct(newProduct);
                        (e.target as HTMLFormElement).reset();
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                        <input name="name" required className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" placeholder="e.g. Red Velvet Cake" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                        <select name="category" required className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500">
                            {Object.values(ProductCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea name="description" required className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" rows={3} placeholder="Product description..." />
                    </div>
                    
                    {/* Price and Stock separated into their own rows/divs for better mobile layout */}
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Price (₱)</label>
                        <input name="price" type="number" required min="0" className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" placeholder="0.00" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Initial Stock</label>
                        <input name="stock" type="number" required min="0" className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" placeholder="0" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Product Image URL</label>
                        <input name="imageUrl" type="url" className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm" placeholder="https://..." />
                        <p className="text-xs text-stone-400 mt-1.5">
                            Paste any image URL or a Google Drive share/view link — it will be converted automatically. Leave empty to use a default image.
                        </p>
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <button type="submit" className="bg-rose-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-600 transition-colors">
                            Add Product
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4">
                    Current Menu Items
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="flex flex-col p-4 border border-stone-100 rounded-xl hover:shadow-md transition-all bg-stone-50/50">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 flex-shrink-0">
                                    <img src={product.image} alt={product.name} className="w-full h-full rounded-lg object-cover bg-stone-200" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-stone-800 truncate">{product.name}</h4>
                                        <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full whitespace-nowrap">{product.category}</span>
                                    </div>
                                    <p className="text-sm text-stone-500 line-clamp-2 my-1">{product.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-rose-500">₱{product.price}</span>
                                        <span className="text-xs text-stone-400">Stock: {product.stock}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct({ ...product })}
                                    className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeletingProductId(product.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-xl shadow-md flex flex-col justify-between">
                    <p className="text-rose-100 text-xs font-semibold uppercase tracking-wide">Total Revenue</p>
                    <div>
                        <p className="text-3xl font-bold mt-2">₱{totalRevenue.toLocaleString()}</p>
                        <p className="text-rose-200 text-xs mt-1">from non-cancelled orders</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-col justify-between">
                    <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Total Orders</p>
                    <div>
                        <p className="text-3xl font-bold text-stone-800 mt-2">{orders.filter(o => !o.isCustomInquiry).length}</p>
                        <p className="text-stone-400 text-xs mt-1">{orders.filter(o => o.isCustomInquiry).length} custom inquiries</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-col justify-between">
                    <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Avg Order Value</p>
                    <div>
                        <p className="text-3xl font-bold text-stone-800 mt-2">₱{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p className="text-stone-400 text-xs mt-1">per completed order</p>
                    </div>
                </div>
                {/* Row 2 */}
                <div className="bg-green-50 border border-green-100 p-5 rounded-xl flex flex-col justify-between">
                    <p className="text-green-600 text-xs font-semibold uppercase tracking-wide">Completed</p>
                    <div>
                        <p className="text-3xl font-bold text-green-700 mt-2">{completedOrders}</p>
                        <p className="text-green-500 text-xs mt-1">
                          {orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0}% completion rate
                        </p>
                    </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col justify-between">
                    <p className="text-amber-600 text-xs font-semibold uppercase tracking-wide">Pending</p>
                    <div>
                        <p className="text-3xl font-bold text-amber-700 mt-2">{pendingOrders}</p>
                        <p className="text-amber-500 text-xs mt-1">awaiting confirmation</p>
                    </div>
                </div>
                <div className={`p-5 rounded-xl flex flex-col justify-between border ${
                  needsPriceQuote > 0
                    ? 'bg-violet-50 border-violet-100'
                    : 'bg-white border-stone-200'
                }`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${
                      needsPriceQuote > 0 ? 'text-violet-600' : 'text-stone-400'
                    }`}>Needs Price Quote</p>
                    <div>
                        <p className={`text-3xl font-bold mt-2 ${
                          needsPriceQuote > 0 ? 'text-violet-700' : 'text-stone-800'
                        }`}>{needsPriceQuote}</p>
                        <p className={`text-xs mt-1 ${
                          needsPriceQuote > 0 ? 'text-violet-400' : 'text-stone-400'
                        }`}>custom cake inquiries</p>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert Banner */}
            {lowStockCount > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-700 text-sm">Low Stock Alert</p>
                  <p className="text-red-500 text-xs">{lowStockCount} product{lowStockCount !== 1 ? 's' : ''} at 5 units or below — consider restocking soon.</p>
                </div>
                <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  View Inventory
                </button>
              </div>
            )}

            {/* Charts Section - Stacked for better visibility */}
            <div className="space-y-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-[450px] overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-stone-800">Revenue Trends</h3>
                        <div className="flex bg-stone-100 rounded-lg p-1">
                            <button 
                                onClick={() => setReportTimeframe('weekly')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${reportTimeframe === 'weekly' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}
                            >
                                Weekly
                            </button>
                            <button 
                                onClick={() => setReportTimeframe('monthly')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${reportTimeframe === 'monthly' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                            <XAxis 
                                dataKey="name" 
                                tick={{fontSize: 11, fill: '#78716c'}} 
                                axisLine={false} 
                                tickLine={false} 
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                            />
                            <YAxis tick={{fontSize: 11, fill: '#78716c'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 8, fill: '#f43f5e' }} dot={{ fill: '#f43f5e', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Best Selling Chart - Vertical Layout */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-[500px] overflow-hidden">
                    <h3 className="text-lg font-bold text-stone-800 mb-6">Best Selling Products</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productSales} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e5e5" />
                            <XAxis type="number" tick={{fontSize: 11, fill: '#78716c'}} axisLine={false} tickLine={false} />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={90} 
                                tick={{fontSize: 11, fill: '#78716c'}} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <Tooltip 
                                cursor={{fill: '#f5f5f4'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36}/>
                            <Bar dataKey="sales" name="Units Sold" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={32}>
                                <LabelList dataKey="sales" position="right" style={{ fill: '#78716c', fontSize: 11 }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {/* Full Product Edit Modal */}
      {editingProduct && (() => {
        const previewUrl = editingProduct.image.trim() ? normalizeImageUrl(editingProduct.image) : '';
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 my-4">
            <h4 className="font-bold text-stone-800 mb-5 text-lg">Edit Product</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value as ProductCategory } : null)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  >
                    {Object.values(ProductCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: Number(e.target.value) } : null)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, image: e.target.value } : null)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  placeholder="https://..."
                />
                <p className="text-xs text-stone-400 mt-1">Google Drive share links are converted automatically.</p>
              </div>
              {previewUrl && (
                <div className="w-full h-32 rounded-lg border border-stone-200 bg-stone-100 overflow-hidden">
                  <img key={previewUrl} src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await updateProduct({ ...editingProduct, image: normalizeImageUrl(editingProduct.image) });
                  setEditingProduct(null);
                }}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium text-sm hover:bg-rose-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Delete Product Confirm Modal */}
      {deletingProductId && (() => {
        const product = products.find(p => p.id === deletingProductId);
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h4 className="font-bold text-stone-800 mb-2">Remove Product?</h4>
            <p className="text-sm text-stone-500 mb-5">
              <span className="font-semibold text-stone-700">"{product?.name}"</span> will be permanently removed from the menu. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default AdminDashboard;
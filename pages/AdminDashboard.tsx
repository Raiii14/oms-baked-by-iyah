import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderStatus, PaymentMethod, ProductCategory, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, LabelList } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Cake, Filter, ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { orders, products, updateOrderStatus, updateInventory, updateInquiryPrice, addProduct, updateProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries' | 'inventory' | 'reports' | 'menu'>('orders');
  const [reportTimeframe, setReportTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  // Helper to handle file upload
  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleProductImageUpdate = async (product: Product, file: File) => {
      try {
          const imageUrl = await handleImageUpload(file);
          await updateProduct({ ...product, image: imageUrl });
      } catch (error) {
          console.error("Error updating image:", error);
      }
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
              onClick={() => setActiveTab(tab.id as 'orders' | 'inquiries' | 'inventory' | 'reports' | 'menu')}
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-500" />
                    <span className="text-sm font-medium text-stone-700">Status:</span>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="border border-stone-300 rounded-md text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-rose-500"
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
                        className="border border-stone-300 rounded-md text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-rose-500"
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
               <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 border-b border-stone-100 pb-4">
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
                 <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                        <p className="font-bold text-lg">₱{order.totalAmount}</p>
                        <p className="text-xs text-stone-500">{order.paymentMethod}</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`appearance-none w-full md:w-auto pl-4 pr-8 py-2 rounded-lg text-sm font-bold border-none outline-none cursor-pointer transition-colors ${
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
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 hover:bg-stone-50 rounded-lg border border-transparent hover:border-stone-100 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    <div>
                        <p className="font-bold text-stone-800">{product.name}</p>
                        <p className="text-xs text-stone-500">Price: ₱{product.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button 
                            onClick={() => {
                                const val = Math.max(0, product.stock - 1);
                                updateInventory(product.id, 'product', val);
                            }}
                            className="px-3 py-1 bg-stone-50 hover:bg-stone-100 text-stone-600 border-r border-stone-200"
                        >
                            -
                        </button>
                        <input 
                            type="number" 
                            value={product.stock}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 0 && val <= 500) {
                                    updateInventory(product.id, 'product', val);
                                }
                            }}
                            className="w-16 text-center py-1 outline-none text-sm font-medium"
                            min="0"
                            max="500"
                        />
                        <button 
                            onClick={() => {
                                const val = Math.min(500, product.stock + 1);
                                updateInventory(product.id, 'product', val);
                            }}
                            className="px-3 py-1 bg-stone-50 hover:bg-stone-100 text-stone-600 border-l border-stone-200"
                        >
                            +
                        </button>
                    </div>
                    <span className="text-xs text-stone-400 w-12 text-right">/ 500</span>
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
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const imageFile = formData.get('imageFile') as File;
                        let imageUrl = formData.get('imageUrl') as string;

                        if (imageFile && imageFile.size > 0) {
                            imageUrl = await handleImageUpload(imageFile);
                        } else if (!imageUrl) {
                            imageUrl = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">Product Image</label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-500 w-16">Upload:</span>
                                <input name="imageFile" type="file" accept="image/*" className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"/>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-500 w-16">Or URL:</span>
                                <input name="imageUrl" type="url" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500 text-sm" placeholder="https://..." />
                            </div>
                        </div>
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
                        <div key={product.id} className="flex gap-4 p-4 border border-stone-100 rounded-xl hover:shadow-md transition-all bg-stone-50/50">
                            <div className="relative group w-20 h-20 flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full rounded-lg object-cover bg-stone-200" />
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleProductImageUpdate(product, e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-stone-800">{product.name}</h4>
                                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full">{product.category}</span>
                                </div>
                                <p className="text-sm text-stone-500 line-clamp-2 my-1">{product.description}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-bold text-rose-500">₱{product.price}</span>
                                    <span className="text-xs text-stone-400">Stock: {product.stock}</span>
                                </div>
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
    </div>
  );
};

export default AdminDashboard;
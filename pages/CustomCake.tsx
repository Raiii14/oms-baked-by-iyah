import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Upload, Calendar, Send, X, Sparkles } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { compressImage } from '../utils/imageCompression';
import { getMinDate } from '../utils/dateUtils';

interface PastCake { name: string; image: string; }

const PAST_CAKES: PastCake[] = [
  { name: 'Brookies Tower',             image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/487108081_1060524726096042_4061940913461564815_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=74x8pmvqsDkQ7kNvwH4jh9_&_nc_oc=Adnc1NYT3pUXNg-2JWVOhvz3HkzfQdLgHORpcJPMkIa865BWxHgT1S1-kFh8-vnmuSc&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=i_sQIVtX7eobxsB-JQKnVg&_nc_ss=8&oh=00_Afw7wVGL3runxLNmz4936XQr3M4MK2E5Oao0DHf0CSPMAA&oe=69B3014B' },
  { name: "Mother's Day Cake",           image: 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-6/496844213_1096896189125562_1980152484651145326_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=rHHASGHB3roQ7kNvwHILEXC&_nc_oc=AdnNaPnnJmvrlNAYtpguf4COP3lAS1AQiKJIXAWIl-jhXnwCC9nA-JsAx5ovF_1vKmg&_nc_zt=23&_nc_ht=scontent-mnl1-1.xx&_nc_gid=xiQDz1X6TUJB7IVhzOFztw&_nc_ss=8&oh=00_Afx9JtIbM8gkNaywkzP8hQE7bWqH6l2WEr8l7PFdy01xkQ&oe=69B31C06' },
  { name: 'Debut Cake',                  image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/487143206_1060524739429374_7498172421836945018_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=5Mx6qCVeXi4Q7kNvwG4widi&_nc_oc=Adm2I8buY-IPAldiKPIck4pjNipDe-0_aMBAfSX_M7LMJRINWh3ZCPhivv2WnBH6WL8&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=NDPWLkGmwAnG1qfmwe1juA&_nc_ss=8&oh=00_AfzAc8ijRJmkI_R6vtnS0zrJc9V2SG3Bgk6qSQkoi781ag&oe=69B309B1' },
  { name: 'Chocolate Overload Cake',     image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/494786922_1086787506803097_4302366667543655730_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=0VZ4dX5cG2cQ7kNvwEYXVbS&_nc_oc=AdkRbFuXL47cxGgXSYQO7Y3xwdS1RKdLD2Mt_SlG5GaLPLweufGZmU8IYTDCilQHO4A&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=VuPPVMQYkgHpoeo9fwDsvA&_nc_ss=8&oh=00_AfymNH2jDrg5HUkI_j3bC4VHA0N-J_3_Bj9Vg6_esMnI5A&oe=69B315B2' },
  { name: 'Spiderman Themed Cake',       image: 'https://scontent-mnl3-2.xx.fbcdn.net/v/t39.30808-6/512003522_1127062139442300_1954159200695648108_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=6FBRMuzahowQ7kNvwG78_mU&_nc_oc=Adm40HWlr9VvJ92Kf6yVEXde5wL3p0hvBp6O38qrXU0v7F4_OfrLxr7FHmxFgnHIOGA&_nc_zt=23&_nc_ht=scontent-mnl3-2.xx&_nc_gid=sZJ2oXDNRws8bixey4-JvA&_nc_ss=8&oh=00_AfyfH2En_OXBExBP3oi74lQNRjS4WEsdOWm-CC6lNuODGw&oe=69B32F06' },
  { name: 'Vintage Themed Cake',         image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/535778182_1171987488283098_379305248485660217_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=7b2446&_nc_ohc=ahK6J5JiVZEQ7kNvwGMv5Kr&_nc_oc=AdmDMRqR91uwQ6ENZ_AeiSPl78KoQYtx_R0NW9FXI87PKtZGCACHJUsUTI_nQ7--bos&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=TIfQ1koNL81_XyZL5EI83w&_nc_ss=8&oh=00_AfyoYJ2XZtb-oPb5XpcfEvMj_7-YqHdfjvv82fC6e-hpXQ&oe=69B3051B' },
  { name: 'Tulip Bouqcake',              image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/547997162_1195820302566483_8910351040558425401_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=L_SS7aQaEhkQ7kNvwFr6ISq&_nc_oc=AdkM6fRa5ov5-BEvlONah8XJSIwBpsv5RxklNc8xKNEGDwNCZ3zUb2QIZSqlrUnCi4g&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=AFJbhdBEHHMvZ1_Qt2eamA&_nc_ss=8&oh=00_AfwILU6MuFqzRRJLRwb9Ejzu8pTsvsSzOJSznkYJ23xyyA&oe=69B31D30' },
  { name: 'Interior Design Themed Cake', image: 'https://scontent-mnl3-1.xx.fbcdn.net/v/t39.30808-6/535926836_1171987581616422_5803633332250890303_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Qhn5MsVE_y8Q7kNvwHrFT3Z&_nc_oc=AdmDarXYFbscmDCNwtQfnthSFWr-CmUA9QLp8a6tuoRhH9DmVwU0yaAEo97qdjroUqA&_nc_zt=23&_nc_ht=scontent-mnl3-1.xx&_nc_gid=SpPINcF6o8Pt1wW6pk-_5Q&_nc_ss=8&oh=00_Afwepoo51Q_pag-fN973oaB9ted4WoNxD8JHkQHvFJ1iHA&oe=69B31089' },
  { name: 'SpongeBob Themed Cake',       image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/547997162_1195820302566483_8910351040558425401_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=L_SS7aQaEhkQ7kNvwFr6ISq&_nc_oc=AdkM6fRa5ov5-BEvlONah8XJSIwBpsv5RxklNc8xKNEGDwNCZ3zUb2QIZSqlrUnCi4g&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=AFJbhdBEHHMvZ1_Qt2eamA&_nc_ss=8&oh=00_AfwILU6MuFqzRRJLRwb9Ejzu8pTsvsSzOJSznkYJ23xyyA&oe=69B31D30' },
  { name: 'Coding Themed Cake',          image: 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-6/487567325_1060908922724289_5619092308825302151_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=XnydoAVOKiUQ7kNvwHUjJVg&_nc_oc=Adn5nGxX2gFWjC6YGDhFUw99yEfeqQqzisXYpIzcXdM7p3xFfX3wUwvKDw7Lg51Jphg&_nc_zt=23&_nc_ht=scontent-mnl1-1.xx&_nc_gid=VV_1bRSnvrGYzSciXJfLTw&_nc_ss=8&oh=00_Afx9c1fJsi6TVJSZ7ygYeigvQ_ei-8Wss36BFdHTIDjDTw&oe=69B30B97' },
  { name: 'Red Vintage Bow Cake',        image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/557985391_1212074240941089_8356171292982685372_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=SP-wABdemMcQ7kNvwH6AjFU&_nc_oc=Adll2_5S9FeoxMrw0V-tShZpXT-7UDTQg2mTK_SjEDmkobFDAJNxLLQIXrxDRy7C1Ys&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=O6IGwS2wQXturjnoa1AwqA&_nc_ss=8&oh=00_AfzdaKbMLi4nX9ZOlIV0DZu89JoUGR5HyhNXOvVhkYtrbw&oe=69B302AD' },
  { name: 'Kuromi Themed Cake (Twin)',   image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/489845443_1067976972017484_4570877682225026267_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=JsnQQUp1qb0Q7kNvwGYr89m&_nc_oc=Adnx1DjALamADFsAg2iwqCovVhabmQEFHDr6I5y0qq6lkl3cMZuSoG_Ty2zsVENbhXI&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=GhpaUrDj8mMy3gCbNeyt1A&_nc_ss=8&oh=00_Afx7FgZHcRaVwpahj38wdHvqqD7QkTMf5KMvMFKFlKDRcw&oe=69B31AE6' },
  { name: 'Kuromi Themed Cake',          image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/488250058_1065369775611537_4884608332579361473_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_ohc=V6y6cyZ6TK0Q7kNvwE8bvaW&_nc_oc=Adk3x9dkk_T3DvEdpWBJn5VYkKDaEJQjf_Y4vpwp-txjVXztF0SJH-FCkgmGt6iOSxQ&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=yoKoNzTIf99s0sHbb3NXtA&_nc_ss=8&oh=00_AfxHlRCCZmN-JqdpGCWrW4d5t8U-wcLV3g2ZX0XFjHEEzQ&oe=69B2FBF9' },
];

const CustomCake: React.FC = () => {
  const { submitCustomInquiry, user } = useStore();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    size: '6 inch',
    date: '',
    notes: '',
    image: null as File | null
  });
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lightboxCake, setLightboxCake] = useState<PastCake | null>(null);

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  // Redirect admins to dashboard
  React.useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.role === UserRole.ADMIN) return;

    if (!user) {
      setShowLoginWarning(true);
      return;
    }

    submitCustomInquiry(formData);
    setShowSuccessModal(true);
    
    // Reset form
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      size: '6 inch',
      date: '',
      notes: '',
      image: null
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 0.7, 1024);
        setFormData({ ...formData, image: compressed });
      } catch (err) {
        console.error("Compression failed", err);
        setFormData({ ...formData, image: file });
      }
    }
  };

  const useAsInspiration = (cake: PastCake) => {
    setLightboxCake(null);
    setFormData(prev => ({ ...prev, notes: `I'd like a cake similar to the "${cake.name}" style.` }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="space-y-12">
      <Modal
        isOpen={showLoginWarning}
        onClose={() => setShowLoginWarning(false)}
        type="warning"
        title="Login Required"
        message="You need to be logged in to submit a custom cake inquiry. Please log in or create an account to continue."
        primaryAction={{ label: 'Log In', onClick: () => navigate('/login') }}
        secondaryAction={{ label: 'Cancel', onClick: () => setShowLoginWarning(false) }}
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); navigate('/cart', { state: { activeTab: 'custom' } }); }}
        type="success"
        title="Inquiry Sent!"
        message="Your custom cake inquiry has been sent successfully. We will review your request and send you a price quote shortly."
        primaryAction={{
          label: 'View Inquiry',
          onClick: () => { setShowSuccessModal(false); navigate('/cart', { state: { activeTab: 'custom' } }); }
        }}
      />

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxCake && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
          onClick={() => setLightboxCake(null)}
        >
          <div
            className="relative w-full max-w-xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxCake(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={lightboxCake.image}
              alt={lightboxCake.name}
              className="w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-white font-semibold text-lg truncate">{lightboxCake.name}</p>
              <button
                onClick={() => useAsInspiration(lightboxCake)}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold rounded-full transition-colors shadow-lg"
              >
                <Sparkles className="w-4 h-4" /> Use as Inspiration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery ───────────────────────────────────────────────────────── */}
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Custom Cake Gallery</h1>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto">
            Browse our past creations for inspiration. Click any cake to view it up close — you can use it as a reference when filling out your inquiry below.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PAST_CAKES.map((cake) => (
            <button
              key={cake.name}
              onClick={() => setLightboxCake(cake)}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              aria-label={`View ${cake.name}`}
            >
              <img
                src={cake.image}
                alt={cake.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-white text-sm font-semibold leading-tight text-left">{cake.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Inquiry Form ──────────────────────────────────────────────────── */}
      <div ref={formRef} className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-rose-50 p-8 text-center border-b border-rose-100">
            <h2 className="text-3xl font-bold text-stone-800">Custom Cake Inquiry</h2>
            <p className="text-stone-600 mt-2 max-w-lg mx-auto">
              Have a design in mind? Fill out the details below and we'll send you a price quote!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section 1: Contact Info */}
            {!user && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">Contact Information</h3>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Section 2: Cake Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">Cake Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Cake Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white transition-all"
                  >
                    <option value="6 inch">6 inch Round</option>
                    <option value="8 inch">8 inch Round</option>
                    <option value="10 inch">10 inch Round</option>
                    <option value="2 Tier">2 Tier</option>
                    <option value="Other">Other (Specify in notes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date Needed</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={getMinDate()}
                      className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Orders must be placed at least 1 day in advance.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Design & Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">Design & Customization</h3>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Design Reference (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-all cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-stone-400 group-hover:text-rose-500 transition-colors" />
                    <div className="flex text-sm text-stone-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-stone-500">PNG, JPG up to 5MB</p>
                    {formData.image && (
                      <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm font-medium inline-block border border-green-200">
                        Selected: {formData.image.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Additional Notes / Theme / Flavors</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  placeholder="Tell us about the design, colors, or specific flavors you want..."
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transform transition-all hover:scale-[1.02]"
              >
                <Send className="w-5 h-5" />
                Get Price Quote
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomCake;
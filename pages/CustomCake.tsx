import React, { useState } from 'react';
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
  { name: 'Tulip Bouqcake',              image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/537023479_1171996674948846_5876839080930745082_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=AZ3993t3bKQQ7kNvwGdVDN8&_nc_oc=AdmapsczytBb0h9z2u9INaBlB-6jfcI5MEWRl0ZpL57EVqmXTVxCik1Kjz0goV4gZQM&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=lc7CSi27fpHCIYBtgW5WqA&_nc_ss=8&oh=00_AfzM5cKkMjYvSlFo7t3FcexOhxNx-TyVzToMSPkF_B2Odw&oe=69B34F81' },
  { name: 'Interior Design Themed Cake', image: 'https://scontent-mnl3-1.xx.fbcdn.net/v/t39.30808-6/535926836_1171987581616422_5803633332250890303_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Qhn5MsVE_y8Q7kNvwHrFT3Z&_nc_oc=AdmDarXYFbscmDCNwtQfnthSFWr-CmUA9QLp8a6tuoRhH9DmVwU0yaAEo97qdjroUqA&_nc_zt=23&_nc_ht=scontent-mnl3-1.xx&_nc_gid=SpPINcF6o8Pt1wW6pk-_5Q&_nc_ss=8&oh=00_Afwepoo51Q_pag-fN973oaB9ted4WoNxD8JHkQHvFJ1iHA&oe=69B31089' },
  { name: 'SpongeBob Themed Cake',       image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/547997162_1195820302566483_8910351040558425401_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=L_SS7aQaEhkQ7kNvwFr6ISq&_nc_oc=AdkM6fRa5ov5-BEvlONah8XJSIwBpsv5RxklNc8xKNEGDwNCZ3zUb2QIZSqlrUnCi4g&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=AFJbhdBEHHMvZ1_Qt2eamA&_nc_ss=8&oh=00_AfwILU6MuFqzRRJLRwb9Ejzu8pTsvsSzOJSznkYJ23xyyA&oe=69B31D30' },
  { name: 'Coding Themed Cake',          image: 'https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-6/487567325_1060908922724289_5619092308825302151_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=XnydoAVOKiUQ7kNvwHUjJVg&_nc_oc=Adn5nGxX2gFWjC6YGDhFUw99yEfeqQqzisXYpIzcXdM7p3xFfX3wUwvKDw7Lg51Jphg&_nc_zt=23&_nc_ht=scontent-mnl1-1.xx&_nc_gid=VV_1bRSnvrGYzSciXJfLTw&_nc_ss=8&oh=00_Afx9c1fJsi6TVJSZ7ygYeigvQ_ei-8Wss36BFdHTIDjDTw&oe=69B30B97' },
  { name: 'Red Vintage Bow Cake',        image: 'https://scontent-mnl1-2.xx.fbcdn.net/v/t39.30808-6/557985391_1212074240941089_8356171292982685372_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=7b2446&_nc_ohc=SP-wABdemMcQ7kNvwH6AjFU&_nc_oc=Adll2_5S9FeoxMrw0V-tShZpXT-7UDTQg2mTK_SjEDmkobFDAJNxLLQIXrxDRy7C1Ys&_nc_zt=23&_nc_ht=scontent-mnl1-2.xx&_nc_gid=O6IGwS2wQXturjnoa1AwqA&_nc_ss=8&oh=00_AfzdaKbMLi4nX9ZOlIV0DZu89JoUGR5HyhNXOvVhkYtrbw&oe=69B302AD' },
  { name: 'Kuromi Themed Cake (Twin)',   image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/489845443_1067976972017484_4570877682225026267_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=JsnQQUp1qb0Q7kNvwGYr89m&_nc_oc=Adnx1DjALamADFsAg2iwqCovVhabmQEFHDr6I5y0qq6lkl3cMZuSoG_Ty2zsVENbhXI&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=GhpaUrDj8mMy3gCbNeyt1A&_nc_ss=8&oh=00_Afx7FgZHcRaVwpahj38wdHvqqD7QkTMf5KMvMFKFlKDRcw&oe=69B31AE6' },
  { name: 'Kuromi Themed Cake',          image: 'https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/488250058_1065369775611537_4884608332579361473_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_ohc=V6y6cyZ6TK0Q7kNvwE8bvaW&_nc_oc=Adk3x9dkk_T3DvEdpWBJn5VYkKDaEJQjf_Y4vpwp-txjVXztF0SJH-FCkgmGt6iOSxQ&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=yoKoNzTIf99s0sHbb3NXtA&_nc_ss=8&oh=00_AfxHlRCCZmN-JqdpGCWrW4d5t8U-wcLV3g2ZX0XFjHEEzQ&oe=69B2FBF9' },
];

const SIZE_OPTIONS = [
  { value: '6 inch', label: '6"', sub: 'Round' },
  { value: '8 inch', label: '8"', sub: 'Round' },
  { value: '10 inch', label: '10"', sub: 'Round' },
  { value: '2 Tier', label: '2', sub: 'Tier' },
  { value: 'Other', label: '?', sub: 'Other' },
];

const TOPPER_OPTIONS = ['Toy Topper', 'Fondant Topper', 'Others'];

type TopperType = typeof TOPPER_OPTIONS[number];

interface FormState {
  name: string;
  email: string;
  size: string;
  sizeOther: string;
  date: string;
  servings: string;
  flavor: string;
  cakeMessage: string;
  color: string;
  toppers: TopperType[];
  toyTopperDetail: string;
  fondantTopperDetail: string;
  toppersOther: string;
  notes: string;
  image: File | null;
  inspirationCake: string;
  inspirationElements: string;
}

const blankForm = (user: { name: string; email: string } | null): FormState => ({
  name: user?.name || '',
  email: user?.email || '',
  size: '6 inch',
  sizeOther: '',
  date: '',
  servings: '',
  flavor: '',
  cakeMessage: '',
  color: '',
  toppers: [],
  toyTopperDetail: '',
  fondantTopperDetail: '',
  toppersOther: '',
  notes: '',
  image: null,
  inspirationCake: '',
  inspirationElements: '',
});

const CustomCake: React.FC = () => {
  const { submitCustomInquiry, user } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>(() => blankForm(user));
  const [showForm, setShowForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lightboxCake, setLightboxCake] = useState<PastCake | null>(null);

  React.useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
  }, [user]);

  React.useEffect(() => {
    if (user?.role === UserRole.ADMIN) navigate('/admin');
  }, [user, navigate]);

  // Lock body scroll when the form modal is open
  React.useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm]);

  const openForm = (inspiration?: PastCake) => {
    setLightboxCake(null);
    setFormData(prev => ({
      ...prev,
      inspirationCake: inspiration?.name ?? '',
      inspirationElements: '',
    }));
    setShowForm(true);
  };

  const closeForm = () => {
    setIsClosingForm(true);
    setTimeout(() => {
      setShowForm(false);
      setIsClosingForm(false);
    }, 220);
  };

  const toggleTopper = (topper: TopperType) => {
    setFormData(prev => ({
      ...prev,
      toppers: prev.toppers.includes(topper)
        ? prev.toppers.filter(t => t !== topper)
        : [...prev.toppers, topper],
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 0.7, 1024);
      setFormData(prev => ({ ...prev, image: compressed }));
    } catch {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowLoginWarning(true); return; }

    // Bundle all structured fields into the notes string sent to the backend
    const parts: string[] = [];
    if (formData.servings)      parts.push(`Servings: ${formData.servings}`);
    if (formData.flavor)        parts.push(`Flavor: ${formData.flavor}`);
    if (formData.cakeMessage)   parts.push(`Message on Cake: ${formData.cakeMessage}`);
    if (formData.color)         parts.push(`Color: ${formData.color}`);
    if (formData.toppers.length) {
      parts.push(`Cake Toppers: ${formData.toppers.join(', ')}`);
      if (formData.toyTopperDetail)     parts.push(`Toy Topper Details: ${formData.toyTopperDetail}`);
      if (formData.fondantTopperDetail) parts.push(`Fondant Topper Details: ${formData.fondantTopperDetail}`);
      if (formData.toppersOther)        parts.push(`Custom Topper: ${formData.toppersOther}`);
    }
    if (formData.inspirationCake) {
      parts.push(`Inspired by: ${formData.inspirationCake}`);
      if (formData.inspirationElements) parts.push(`Design Elements Wanted: ${formData.inspirationElements}`);
    }
    if (formData.notes)         parts.push(`Notes: ${formData.notes}`);

    submitCustomInquiry({
      name:  formData.name,
      email: formData.email,
      size:  formData.size === 'Other' ? (formData.sizeOther || 'Other') : formData.size,
      date:  formData.date,
      notes: parts.join('\n'),
      image: formData.image,
    });

    setIsClosingForm(true);
    setTimeout(() => {
      setShowForm(false);
      setIsClosingForm(false);
      setFormData(blankForm(user));
      setShowSuccessModal(true);
    }, 220);
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

      {/* â”€â”€ Lightbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {lightboxCake && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
          onClick={() => setLightboxCake(null)}
        >
          <div className="relative w-full max-w-xl" onClick={e => e.stopPropagation()}>
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
                onClick={() => openForm(lightboxCake)}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold rounded-full transition-colors shadow-lg"
              >
                <Sparkles className="w-4 h-4" /> Use as Inspiration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Inquiry Form Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showForm && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 ${isClosingForm ? 'form-backdrop-out' : 'form-backdrop-in'}`}
          onClick={closeForm}
        >
          <div
            className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] ${isClosingForm ? 'form-slide-down' : 'form-slide-up'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Custom Cake Inquiry</h2>
                <p className="text-xs text-stone-500 mt-0.5">We'll send you a price quote after reviewing.</p>
              </div>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-8">

              {/* Inspiration section */}
              {formData.inspirationCake && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <p className="text-sm text-rose-700 flex-1 font-medium">
                      Inspired by: <span className="font-semibold">{formData.inspirationCake}</span>
                    </p>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, inspirationCake: '', inspirationElements: '' }))} className="text-rose-300 hover:text-rose-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-rose-600">Help us recreate this for you - answer one quick question so we can send you an accurate price quote right away.</p>
                  <div>
                    <label className="block text-xs font-semibold text-rose-700 mb-1.5">
                      What elements from this cake do you want, and what should be different?
                      <span className="font-normal text-rose-500 ml-1">(required)</span>
                    </label>
                    <p className="text-xs text-rose-500 mb-2">e.g. Keep the floral fondant decorations and 2-tier look, but use lavender instead of pink and add my name on top</p>
                    <textarea
                      rows={3}
                      required
                      value={formData.inspirationElements}
                      onChange={e => setFormData(prev => ({ ...prev, inspirationElements: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Contact info - only if not logged in */}
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                  <p className="text-xs text-stone-400 mb-2">e.g. Maria Santos, Juan dela Cruz</p>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
              )}

              {/* Size â€” visual pill selector */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Cake Size</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, size: opt.value, sizeOther: '' }))}
                      className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 text-center transition-all ${
                        formData.size === opt.value
                          ? 'border-rose-500 bg-rose-50 text-rose-600'
                          : 'border-stone-200 text-stone-500 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                    >
                      <span className="text-lg font-bold leading-tight">{opt.label}</span>
                      <span className="text-[10px] leading-tight">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                {formData.size === 'Other' && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-stone-600 mb-1">Describe the size</label>
                    <p className="text-xs text-stone-400 mb-2">e.g. 3 Tier, Half Sheet, Quarter Sheet, 12 inch Square</p>
                    <input
                      type="text"
                      required
                      value={formData.sizeOther}
                      onChange={e => setFormData(prev => ({ ...prev, sizeOther: e.target.value }))}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Date Needed</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <input
                    type="date" required
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={getMinDate()}
                    className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-stone-400 mt-1">Orders must be placed at least 1 day in advance.</p>
              </div>

              {/* Servings */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Number of Servings / Guests <span className="text-rose-500 font-normal text-xs">*</span>
                </label>
                <select
                  required
                  value={formData.servings}
                  onChange={e => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all bg-white"
                >
                  <option value="">Select approximate serving size</option>
                  <option value="5-10 pax">5 - 10 people</option>
                  <option value="10-20 pax">10 - 20 people</option>
                  <option value="20-30 pax">20 - 30 people</option>
                  <option value="30-50 pax">30 - 50 people</option>
                  <option value="50+ pax">More than 50 people</option>
                </select>
              </div>

              {/* Flavor */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Cake Flavor <span className="text-rose-500 font-normal text-xs">*</span>
                </label>
                <p className="text-xs text-stone-400 mb-2">e.g. Chocolate, Vanilla, Red Velvet, Ube, Matcha, Lemon</p>
                <input
                  type="text"
                  required
                  value={formData.flavor}
                  onChange={e => setFormData(prev => ({ ...prev, flavor: e.target.value }))}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              {/* Message on Cake */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Message on Cake <span className="text-stone-400 font-normal">(optional)</span></label>
                <p className="text-xs text-stone-400 mb-2">e.g. Happy Birthday Ana!, Congratulations!, Happy 18th Sarah - leave blank if you don't want any text.</p>
                <input
                  type="text"
                  value={formData.cakeMessage}
                  onChange={e => setFormData(prev => ({ ...prev, cakeMessage: e.target.value }))}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Color Preference <span className="text-stone-400 font-normal">(optional)</span></label>
                <p className="text-xs text-stone-400 mb-2">e.g. Pastel pink with white accents, black and gold, baby blue</p>
                <input
                  type="text"
                  value={formData.color}
                  onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              {/* Cake Toppers */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Cake Toppers <span className="text-stone-400 font-normal">(optional)</span></label>
                <p className="text-xs text-stone-400 mb-3">Select all that apply. Each type has its own description to help you decide.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {TOPPER_OPTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTopper(t)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        formData.toppers.includes(t)
                          ? 'border-rose-500 bg-rose-50 text-rose-600'
                          : 'border-stone-200 text-stone-500 hover:border-rose-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {formData.toppers.includes('Toy Topper') && (
                  <div className="mb-3 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Toy Topper</p>
                      <p className="text-xs text-amber-600 mt-0.5">A physical figurine, toy, or decorative object placed on top of the cake. You can bring your own or describe what you have in mind.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">Describe the toy or figurine</label>
                      <p className="text-xs text-amber-500 mb-2">e.g. A Barbie doll, superhero action figure, mini plushie, acrylic number sign</p>
                      <input
                        type="text"
                        value={formData.toyTopperDetail}
                        onChange={e => setFormData(prev => ({ ...prev, toyTopperDetail: e.target.value }))}
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {formData.toppers.includes('Fondant Topper') && (
                  <div className="mb-3 p-4 bg-pink-50 border border-pink-200 rounded-xl space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-pink-800">Fondant Topper</p>
                      <p className="text-xs text-pink-600 mt-0.5">A hand-crafted edible decoration shaped from sugar paste. Perfect for characters, flowers, name plates, and custom designs sculpted just for you.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-pink-800 mb-1">Describe the fondant topper</label>
                      <p className="text-xs text-pink-500 mb-2">e.g. A fondant flower bouquet in blush pink, "Happy Birthday" name plate, a character's face, balloon numbers</p>
                      <input
                        type="text"
                        value={formData.fondantTopperDetail}
                        onChange={e => setFormData(prev => ({ ...prev, fondantTopperDetail: e.target.value }))}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                  </div>
                )}

                {formData.toppers.includes('Others') && (
                  <div className="mb-3 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Describe your custom topper <span className="text-rose-500">*</span></label>
                    <p className="text-xs text-stone-400 mb-2">e.g. I'll bring my own decoration, a custom acrylic sign, fresh floral arrangement</p>
                    <input
                      type="text"
                      required
                      value={formData.toppersOther}
                      onChange={e => setFormData(prev => ({ ...prev, toppersOther: e.target.value }))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Design reference upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Design Reference <span className="text-stone-400 font-normal">(optional)</span></label>
                <div className="flex justify-center px-6 pt-4 pb-5 border-2 border-stone-300 border-dashed rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-all cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-stone-400 group-hover:text-rose-500 transition-colors" />
                    <div className="flex text-sm text-stone-600 justify-center">
                      <label htmlFor="file-upload" className="cursor-pointer font-medium text-rose-600 hover:text-rose-500">
                        <span>Upload a file</span>
                        <input id="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-stone-500">PNG, JPG up to 5MB</p>
                    {formData.image && (
                      <p className="text-xs text-emerald-600 font-medium">âœ“ {formData.image.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Other Notes <span className="text-stone-400 font-normal">(optional)</span></label>
                <p className="text-xs text-stone-400 mb-2">e.g. Please avoid alcohol in the ingredients, contact me before proceeding, any allergies to note</p>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>

              {/* Submit */}
              <div className="pb-1">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl shadow-md text-base font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Floating Request FAB - only on this page, sits above the cart FAB */}
      {!showForm && (
        <button
          onClick={() => openForm()}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 pl-4 pr-5 h-12 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Request a custom cake"
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          Request a Cake
        </button>
      )}
      {/* â”€â”€ Gallery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Custom Cake Gallery</h1>
          <p className="text-stone-500 mt-2 max-w-xl mx-auto">
            Browse our past creations for inspiration, then tell us what you have in mind.
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
    </div>
  );
};

export default CustomCake;

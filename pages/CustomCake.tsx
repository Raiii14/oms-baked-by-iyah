import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Upload, Calendar, Send, X, Sparkles } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { UserRole, PastCake, FormState, TopperType, TOPPER_OPTIONS } from '../types';
import { PAST_CAKES, SIZE_OPTIONS } from '../constants';
import { compressImage } from '../utils/imageCompression';
import { getMinDate } from '../utils/dateUtils';
import { serializeCustomCakeNotes } from '../utils/customCakeSerializer';

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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
  }, [user]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) navigate('/admin');
  }, [user, navigate]);

  // Lock body scroll when the form modal is open
  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm]);

  // Clear any pending close animation timer on unmount
  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, []);

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
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosingForm(true);
    closeTimerRef.current = setTimeout(() => {
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

    submitCustomInquiry({
      name:  formData.name,
      email: formData.email,
      size:  formData.size === 'Other' ? (formData.sizeOther || 'Other') : formData.size,
      date:  formData.date,
      notes: serializeCustomCakeNotes(formData),
      image: formData.image,
    });

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosingForm(true);
    closeTimerRef.current = setTimeout(() => {
      setShowForm(false);
      setIsClosingForm(false);
      setFormData({ ...blankForm(null), name: user.name, email: user.email });
      setShowSuccessModal(true);
    }, 220);
  };

  const setField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value } as FormState));

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
                      onChange={setField('inspirationElements')}
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
                    onChange={setField('name')}
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
                      onChange={setField('sizeOther')}
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
                    onChange={setField('date')}
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
                  onChange={setField('servings')}
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
                  onChange={setField('flavor')}
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
                  onChange={setField('cakeMessage')}
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
                  onChange={setField('color')}
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
                        onChange={setField('toyTopperDetail')}
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
                        onChange={setField('fondantTopperDetail')}
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
                      onChange={setField('toppersOther')}
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
                  onChange={setField('notes')}
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

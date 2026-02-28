import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Upload, Calendar, Send } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useNavigate } from 'react-router-dom';

const CustomCake: React.FC = () => {
  const { submitCustomInquiry, user } = useStore();
  const navigate = useNavigate();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto">
      <Modal
        isOpen={showLoginWarning}
        onClose={() => setShowLoginWarning(false)}
        type="warning"
        title="Login Required"
        message="You need to be logged in to submit a custom cake inquiry. Please log in or create an account to continue."
        primaryAction={{
          label: 'Log In',
          onClick: () => navigate('/login')
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setShowLoginWarning(false)
        }}
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/cart', { state: { activeTab: 'custom' } });
        }}
        type="success"
        title="Inquiry Sent!"
        message="Your custom cake inquiry has been sent successfully. We will review your request and send you a price quote shortly."
        primaryAction={{
          label: 'View Inquiry',
          onClick: () => {
            setShowSuccessModal(false);
            navigate('/cart', { state: { activeTab: 'custom' } });
          }
        }}
      />

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
  );
};

export default CustomCake;
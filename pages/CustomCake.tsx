import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Upload, Calendar, Send } from 'lucide-react';

const CustomCake: React.FC = () => {
  const { submitCustomInquiry, user } = useStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    size: '6 inch',
    date: '',
    notes: '',
    image: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCustomInquiry(formData);
    // Reset form
    setFormData({
      name: user?.name || '',
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-800">Custom Cake Inquiry</h2>
          <p className="text-stone-500 mt-2">
            Have a design in mind? Fill out the details below and we'll send you a price quote!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!user && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Cake Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white"
              >
                <option value="6 inch">6 inch Round</option>
                <option value="8 inch">8 inch Round</option>
                <option value="10 inch">10 inch Round</option>
                <option value="2 Tier">2 Tier</option>
                <option value="Other">Other (Specify in notes)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Needed Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Design Reference (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-300 border-dashed rounded-lg hover:border-rose-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-stone-400" />
                <div className="flex text-sm text-stone-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-stone-500">PNG, JPG up to 5MB</p>
                {formData.image && (
                  <p className="text-sm text-green-600 font-medium mt-2">Selected: {formData.image.name}</p>
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
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              placeholder="Tell us about the design, colors, or specific flavors you want..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            <Send className="w-4 h-4" />
            Get Price Quote
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomCake;
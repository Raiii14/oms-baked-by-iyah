import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Navigate } from 'react-router-dom';
import { Edit2, AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser, addNotification } = useStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState<'name' | 'phone'>('name');
  const [showInvalidPhoneModal, setShowInvalidPhoneModal] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleEditClick = (field: 'name' | 'phone') => {
    if (field === 'name') {
    // Check 7-day cooldown
    if (user.lastNameUpdate) {
      const daysSinceUpdate = (Date.now() - user.lastNameUpdate) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) {
        const daysLeft = Math.ceil(7 - daysSinceUpdate);
        addNotification(`You can edit your name again in ${daysLeft} days.`, 'error');
        return;
      }
    }
    setNewName(user.name);
    setIsEditingName(true);
      setFieldToUpdate('name');
    } else {
      setNewPhone(user.phoneNumber || '');
      setIsEditingPhone(true);
      setFieldToUpdate('phone');
    }
  };

  const handleSave = (field: 'name' | 'phone') => {
    if (field === 'name') {
      if (newName.trim().length === 0) {
        addNotification('Name cannot be empty', 'error');
        return;
      }
      if (newName.trim().length > 25) {
        addNotification('Name must be 25 characters or less', 'error');
        return;
      }
    } else {
      if (!newPhone.trim()) {
        addNotification('Phone number cannot be empty', 'error');
        return;
      }
      // Basic validation
      const phMobileRegex = /^(09|\+639)\d{9}$/;
      if (!phMobileRegex.test(newPhone.trim())) {
        setShowInvalidPhoneModal(true);
        return;
      }
    }
    setFieldToUpdate(field);
    setShowConfirmModal(true);
  };

  const confirmChange = async () => {
    if (fieldToUpdate === 'name') {
      await updateUser({ 
        name: newName.trim(),
        lastNameUpdate: Date.now()
      });
      setIsEditingName(false);
      addNotification('Name updated successfully!');
    } else {
      await updateUser({
        phoneNumber: newPhone.trim()
      });
      setIsEditingPhone(false);
      addNotification('Phone number updated successfully!');
    }
    setShowConfirmModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-stone-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-stone-900">
            User Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-stone-500">
            Personal details and account information.
          </p>
        </div>
        <div className="border-t border-stone-200">
          <dl>
            <div className="bg-stone-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
              <dt className="text-sm font-medium text-stone-500">
                Full name
              </dt>
              <dd className="mt-1 text-sm text-stone-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                {isEditingName ? (
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 border border-stone-300 rounded px-2 py-1 text-sm"
                      maxLength={25}
                    />
                    <button onClick={() => handleSave('name')} className="text-green-600 hover:text-green-700 font-medium text-xs">Save</button>
                    <button onClick={() => setIsEditingName(false)} className="text-stone-500 hover:text-stone-600 font-medium text-xs">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>{user.name}</span>
                    <button onClick={() => handleEditClick('name')} className="text-rose-500 hover:text-rose-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-stone-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-stone-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div className="bg-stone-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
              <dt className="text-sm font-medium text-stone-500">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm text-stone-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                {isEditingPhone ? (
                  <div className="flex gap-2 w-full">
                    <input 
                      type="tel" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="flex-1 border border-stone-300 rounded px-2 py-1 text-sm"
                      placeholder="09123456789"
                    />
                    <button onClick={() => handleSave('phone')} className="text-green-600 hover:text-green-700 font-medium text-xs">Save</button>
                    <button onClick={() => setIsEditingPhone(false)} className="text-stone-500 hover:text-stone-600 font-medium text-xs">Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>{user.phoneNumber || 'Not set'}</span>
                    <button onClick={() => handleEditClick('phone')} className="text-rose-500 hover:text-rose-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Invalid Phone Modal */}
      {showInvalidPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-stone-900">Invalid Phone Number</h3>
            </div>
            <p className="text-stone-600 mb-2">
              Please enter a valid Philippine mobile number.
            </p>
            <p className="text-sm text-stone-500 mb-6">
              Accepted formats: <strong>09XXXXXXXXX</strong> or <strong>+639XXXXXXXXX</strong>
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowInvalidPhoneModal(false)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-stone-900">Confirm Change</h3>
            </div>
            <p className="text-stone-600 mb-6">
              Are you sure you want to change your {fieldToUpdate} to <strong>{fieldToUpdate === 'name' ? newName : newPhone}</strong>? 
              <br/><br/>
              {fieldToUpdate === 'name' && (
                <span className="text-xs font-semibold text-rose-600">Note: You will only be able to edit your name again after 7 days.</span>
              )}
              {fieldToUpdate === 'phone' && (
                <span className="text-xs font-semibold text-rose-600">Note: You can only change this after 7 days. Make sure your phone number is correct as it will be used for order-related communications.</span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmChange}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

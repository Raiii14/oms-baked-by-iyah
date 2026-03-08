import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useCakePage } from '../hooks/useCakePage';
import CakeFormModal from '../components/CakeFormModal';
import CakeGallery from '../components/CakeGallery';

const Cake: React.FC = () => {
  const {
    formData,
    showForm,
    isClosingForm,
    showLoginWarning, setShowLoginWarning,
    showSuccessModal, setShowSuccessModal,
    lightboxCake, setLightboxCake,
    user,
    navigate,
    openForm,
    closeForm,
    clearInspiration,
    onSizeChange,
    toggleTopper,
    handleImageChange,
    handleSubmit,
    setField,
  } = useCakePage();

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

      {/* Lightbox */}
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

      <CakeFormModal
        isOpen={showForm}
        isClosing={isClosingForm}
        formData={formData}
        user={user}
        onClose={closeForm}
        onSubmit={handleSubmit}
        setField={setField}
        onSizeChange={onSizeChange}
        toggleTopper={toggleTopper}
        onImageChange={handleImageChange}
        onClearInspiration={clearInspiration}
      />

      {/* Floating Request FAB */}
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

      <CakeGallery onSelectCake={setLightboxCake} />
    </div>
  );
};

export default Cake;
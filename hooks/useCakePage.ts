import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { compressImage } from '../utils/imageCompression';
import { PastCake, FormState, TopperType } from '../types';

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

export function useCakePage() {
  const { submitCustomInquiry, user, addNotification } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>(() => blankForm(user));
  const [showForm, setShowForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxCake, setLightboxCake] = useState<PastCake | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
  }, [user]);

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

  const clearInspiration = () =>
    setFormData(prev => ({ ...prev, inspirationCake: '', inspirationElements: '' }));

  const onSizeChange = (size: string) =>
    setFormData(prev => ({ ...prev, size, sizeOther: '' }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowLoginWarning(true); return; }

    setIsSubmitting(true);
    try {
      await submitCustomInquiry({
        name:  formData.name,
        email: formData.email,
        size:  formData.size === 'Other' ? (formData.sizeOther || 'Other') : formData.size,
        date:  formData.date,
        servings: formData.servings,
        flavor: formData.flavor,
        cakeMessage: formData.cakeMessage,
        color: formData.color,
        toppers: formData.toppers,
        toyTopperDetail: formData.toyTopperDetail,
        fondantTopperDetail: formData.fondantTopperDetail,
        toppersOther: formData.toppersOther,
        notes: formData.notes,
        inspirationCake: formData.inspirationCake,
        inspirationElements: formData.inspirationElements,
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
    } catch (err) {
      console.error('[useCakePage] submitCustomInquiry failed:', err);
      addNotification('Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value } as FormState));

  return {
    formData,
    showForm,
    isClosingForm,
    isSubmitting,
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
  };
}

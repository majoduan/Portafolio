import { useState, useCallback, useMemo, memo } from 'react';
import { Mail, Send, User } from 'lucide-react';
import TypingQuotes from './TypingQuotes';
import { useTranslation } from '../hooks/useTranslation';

/**
 * ContactForm Component
 * Optimized contact form that generates mailto link with subject and message
 * Following best practices from PERFORMANCE.md and OPTIMIZATION_GUIDE.md
 * Optimizations: useMemo, useCallback, memo, minimal re-renders
 */
const ContactForm = memo(() => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  // Memoize email constant to prevent recreation
  const emailAddress = useMemo(() => 'mate.due02@gmail.com', []);

  // Optimized with useCallback to prevent re-creation on each render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing - usando callback para evitar dependencia
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []); // Sin dependencias - completamente estable

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.name.error');
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.subject.error');
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.message.error');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact.form.message.error');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Handle form submission - opens mailto with pre-filled data
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create mailto link with encoded parameters
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Hi Mateo,\n\nMy name is ${formData.name}.\n\n${formData.message}\n\nBest regards,\n${formData.name}`
    );
    
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Optional: Clear form after sending (commented out to preserve data in case of email client issues)
    // setFormData({ name: '', subject: '', message: '' });
  }, [formData, validateForm, emailAddress]);

  return (
    <form 
      onSubmit={handleSubmit}
      className="contact-form flex flex-col"
      style={{ contentVisibility: 'auto', contain: 'layout style' }}
    >
      {/* Name Field */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 dark:text-slate-300 text-slate-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          {t('contact.form.name.label')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('contact.form.name.placeholder')}
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
          className={`w-full px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 bg-white border rounded-xl text-white dark:text-white text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
            errors.name 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-700 dark:border-slate-700 border-slate-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400 animate-fadeIn">{errors.name}</p>
        )}
      </div>

      {/* Subject Field */}
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-slate-300 dark:text-slate-300 text-slate-700 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          {t('contact.form.subject.label')}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder={t('contact.form.subject.placeholder')}
          className={`w-full px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 bg-white border rounded-xl text-white dark:text-white text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
            errors.subject 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-700 dark:border-slate-700 border-slate-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-400 animate-fadeIn">{errors.subject}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-slate-300 dark:text-slate-300 text-slate-700 mb-2">
          <Send className="w-4 h-4 inline mr-2" />
          {t('contact.form.message.label')}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t('contact.form.message.placeholder')}
          className={`w-full h-32 md:h-40 lg:h-44 px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 bg-white border rounded-xl text-white dark:text-white text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
            errors.message 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-700 dark:border-slate-700 border-slate-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-400 animate-fadeIn">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 md:py-4 px-6 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 hover:from-red-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-purple-600 rounded-xl font-semibold text-white text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 dark:hover:shadow-blue-500/50 flex items-center justify-center gap-3 group"
      >
        <span>{t('contact.form.submit')}</span>
        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </button>

      {/* Helper text */}
      <p className="text-center text-xs md:text-sm text-slate-400 dark:text-slate-400 text-slate-600 mt-3">
        {t('contact.form.helper')}
      </p>

      {/* Inspirational Quotes - Only visible on desktop */}
      <TypingQuotes />
    </form>
  );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;

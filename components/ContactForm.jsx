'use client';
import React, { useState, useCallback, useMemo, memo } from 'react';
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
      `${t('contact.form.emailBody.greeting')},\n\n${t('contact.form.emailBody.intro')} ${formData.name}.\n\n${formData.message}\n\n${t('contact.form.emailBody.regards')},\n${formData.name}`
    );
    
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
  }, [formData, validateForm, emailAddress, t]);

  return (
    <form 
      onSubmit={handleSubmit}
      className="contact-form flex flex-col"
      style={{ contentVisibility: 'auto', contain: 'layout style' }}
    >
      {/* Name Field */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
          className={`w-full px-4 py-3 bg-white dark:bg-[var(--bg-elevated-50)] border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-inset transition-all duration-300 ${
            errors.name
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-700 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white'
          }`}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-red-400 animate-fadeIn">{errors.name}</p>
        )}
      </div>

      {/* Subject Field */}
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
          aria-invalid={errors.subject ? 'true' : 'false'}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          className={`w-full px-4 py-3 bg-white dark:bg-[var(--bg-elevated-50)] border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-inset transition-all duration-300 ${
            errors.subject
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-700 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white'
          }`}
        />
        {errors.subject && (
          <p id="subject-error" role="alert" className="mt-1 text-sm text-red-400 animate-fadeIn">{errors.subject}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          <Send className="w-4 h-4 inline mr-2" />
          {t('contact.form.message.label')}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={t('contact.form.message.placeholder')}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={`w-full h-32 md:h-40 lg:h-44 px-4 py-3 bg-white dark:bg-[var(--bg-elevated-50)] border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-inset transition-all duration-300 resize-none ${
            errors.message
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-700 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white'
          }`}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-sm text-red-400 animate-fadeIn">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="swap-btn swap-btn-wide"
        ref={(el) => {
          if (el) {
            const text = el.querySelector('.swap-btn-text');
            if (text) el.style.setProperty('--swap-text-w', `${text.offsetWidth}px`);
            el.style.setProperty('--swap-btn-w', `${el.offsetWidth}px`);
          }
        }}
      >
        <span className="swap-btn-bg" />
        <span className="swap-btn-icon">
          <Send className="w-5 h-5 text-white" />
        </span>
        <span className="swap-btn-text">
          {t('contact.form.submit')}
        </span>
      </button>

      {/* Helper text */}
      <p className="text-center text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-3">
        {t('contact.form.helper')}
      </p>

      {/* Inspirational Quotes - Only visible on desktop */}
      <TypingQuotes />
    </form>
  );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;

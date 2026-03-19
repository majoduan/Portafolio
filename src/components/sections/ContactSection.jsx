import React, { lazy, Suspense } from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ContactForm = lazy(() => import('../ContactForm'));

const ContactSection = React.memo(() => {
  const { t } = useTranslation();

  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 lg:py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t('contact.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-stretch">
            {/* Left Column - Profile Image & Info */}
            <div className="contact-left-column">
              {/* Profile Image Card */}
              <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/70 transition-all duration-500 shadow-lg dark:shadow-2xl group h-full flex flex-col">
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-64 sm:h-80 md:h-96 lg:h-[400px] overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  {/* Profile Image */}
                  <picture>
                    <source
                      srcSet="
                        /images/optimized/foto-perfil-400w.avif 400w,
                        /images/optimized/foto-perfil-800w.avif 800w,
                        /images/optimized/foto-perfil-1200w.avif 1200w
                      "
                      sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
                      type="image/avif"
                    />
                    <img
                      src="/images/optimized/foto-perfil-800w.webp"
                      srcSet="
                        /images/optimized/foto-perfil-400w.webp 400w,
                        /images/optimized/foto-perfil-800w.webp 800w,
                        /images/optimized/foto-perfil-1200w.webp 1200w
                      "
                      sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
                      alt="Mateo Dueñas - Software Engineer"
                      width="800"
                      height="1000"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                      decoding="async"
                      fetchpriority="high"
                    />
                  </picture>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent dark:from-slate-900 dark:via-slate-900/60 dark:to-transparent"></div>

                  {/* Animated Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('contact.profile.name')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed flex-1">
                    {t('contact.profile.bio')}
                  </p>

                  {/* Social Links */}
                  <div className="space-y-3 md:space-y-4">
                    <a
                      href="mailto:mate.due02@gmail.com"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/link border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('contact.profile.emailLabel')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">mate.due02@gmail.com</p>
                      </div>
                    </a>

                    <a
                      href="https://linkedin.com/in/mateo-dueñas-andrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/link border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
                        <Linkedin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('contact.profile.linkedinLabel')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">mateo-dueñas-andrade</p>
                      </div>
                    </a>

                    <a
                      href="https://github.com/majoduan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/link border border-slate-200 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-blue-500/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
                        <Github className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('contact.profile.githubLabel')}</p>
                        <p className="text-slate-900 dark:text-white font-medium">majoduan</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="contact-right-column">
              <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-slate-200 dark:border-slate-700/50 hover:border-purple-400 dark:hover:border-purple-500/70 transition-all duration-500 shadow-lg dark:shadow-2xl h-full">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-red-500 to-orange-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {t('contact.form.title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-6 md:mb-8">
                  {t('contact.form.subtitle')}
                </p>
                <Suspense fallback={
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                }>
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400 relative z-10 transition-colors duration-300">
        <p>{t('footer.copyright').replace('2025', new Date().getFullYear()).replace('2026', new Date().getFullYear())}</p>
      </footer>
    </>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;

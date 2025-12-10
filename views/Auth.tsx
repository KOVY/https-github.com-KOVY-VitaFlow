
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../types';
import { MacroRing } from '../components/MacroRing';

interface AuthProps {
  onNavigate: (view: View) => void;
}

export const Auth: React.FC<AuthProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [viewState, setViewState] = useState<'ONBOARDING' | 'LOGIN' | 'REGISTER'>('ONBOARDING');
  const [loading, setLoading] = useState(false);
  
  // Onboarding Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        onNavigate(View.DASHBOARD);
    }, 1000);
  };

  // --- SUB-COMPONENTS ---

  // 1. Voice Visualizer Demo
  const VoiceDemo = () => (
      <div className="flex items-center justify-center gap-1 h-12 w-32">
          {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-vital-500 rounded-full animate-equalizer" 
                style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.8 + Math.random() * 0.5}s` 
                }}
              ></div>
          ))}
      </div>
  );

  // 2. Mood Breathing Demo
  const MoodDemo = () => (
      <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-breathe blur-xl"></div>
          <div className="absolute inset-4 bg-blue-500/20 rounded-full animate-breathe blur-md" style={{ animationDelay: '0.5s' }}></div>
          <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
      </div>
  );

  // 3. Results Demo (Macro Ring)
  const ResultsDemo = () => {
      const [progress, setProgress] = useState(0);
      useEffect(() => {
          const timer = setTimeout(() => setProgress(1850), 300);
          return () => clearTimeout(timer);
      }, []);

      return (
          <div className="scale-125">
             <MacroRing current={progress} target={2200} color="#10b981" label={t('dashboard.kcal')} size="lg" />
          </div>
      );
  };

  const slides = [
      {
          id: 0,
          title: t('onboarding.slide1.title'),
          subtitle: t('onboarding.slide1.subtitle'),
          desc: t('onboarding.slide1.desc'),
          visual: null, // Uses background image
          bg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
      },
      {
          id: 1,
          title: t('onboarding.slide2.title'),
          subtitle: t('onboarding.slide2.subtitle'),
          desc: t('onboarding.slide2.desc'),
          visual: <VoiceDemo />,
          bg: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1887&auto=format&fit=crop"
      },
      {
          id: 2,
          title: t('onboarding.slide3.title'),
          subtitle: t('onboarding.slide3.subtitle'),
          desc: t('onboarding.slide3.desc'),
          visual: <MoodDemo />,
          bg: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2070&auto=format&fit=crop"
      },
      {
          id: 3,
          title: t('onboarding.slide4.title'),
          subtitle: t('onboarding.slide4.subtitle'),
          desc: t('onboarding.slide4.desc'),
          visual: <ResultsDemo />,
          bg: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
      }
  ];

  // --- INTERNAL COMPONENTS FOR FORMS ---

  const LoginForm = () => (
    <div className="animate-fade-in-up w-full max-w-sm z-20 bg-dark-900/80 backdrop-blur-xl p-8 rounded-3xl border border-dark-700 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">{t('auth.loginTitle')}</h1>
            <p className="text-gray-400 text-sm">{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t('auth.email')}</label>
                <input type="email" required className="w-full bg-dark-800 border border-dark-700 focus:border-vital-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder-gray-600" placeholder="name@example.com" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t('auth.password')}</label>
                <input type="password" required className="w-full bg-dark-800 border border-dark-700 focus:border-vital-500 text-white rounded-xl px-4 py-3 outline-none transition-colors placeholder-gray-600" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-vital-600 hover:bg-vital-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-vital-900/40 transform transition-all active:scale-[0.98] disabled:opacity-70 mt-2">
                {loading ? t('common.loading') : t('auth.loginBtn')}
            </button>
        </form>

        <div className="mt-6 text-center">
             <button onClick={() => setViewState('ONBOARDING')} className="text-xs text-gray-500 hover:text-white mb-4 block w-full">
                Back to Intro
            </button>
            <p className="text-sm text-gray-500">
                {t('auth.noAccount')} <button onClick={() => setViewState('REGISTER')} className="ml-1 text-white font-bold hover:underline">{t('auth.switchRegister')}</button>
            </p>
        </div>
    </div>
  );

  const RegisterForm = () => (
    <div className="animate-fade-in-up w-full max-w-sm z-20 bg-dark-900/80 backdrop-blur-xl p-8 rounded-3xl border border-dark-700 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">{t('auth.registerTitle')}</h1>
            <p className="text-gray-400 text-sm">{t('auth.subtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t('auth.name')}</label><input type="text" required className="w-full bg-dark-800 border border-dark-700 focus:border-vital-500 text-white rounded-xl px-4 py-3 outline-none" placeholder="John Doe" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t('auth.email')}</label><input type="email" required className="w-full bg-dark-800 border border-dark-700 focus:border-vital-500 text-white rounded-xl px-4 py-3 outline-none" placeholder="name@example.com" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t('auth.password')}</label><input type="password" required className="w-full bg-dark-800 border border-dark-700 focus:border-vital-500 text-white rounded-xl px-4 py-3 outline-none" placeholder="••••••••" /></div>
            <button type="submit" disabled={loading} className="w-full bg-vital-600 hover:bg-vital-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-vital-900/40 transform transition-all active:scale-[0.98] disabled:opacity-70 mt-2">
                {loading ? t('common.loading') : t('auth.registerBtn')}
            </button>
        </form>
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
                {t('auth.haveAccount')} <button onClick={() => setViewState('LOGIN')} className="ml-1 text-white font-bold hover:underline">{t('auth.switchLogin')}</button>
            </p>
        </div>
    </div>
  );

  // --- ONBOARDING VIEW ---

  if (viewState === 'ONBOARDING') {
      const activeSlide = slides[currentSlide];

      return (
        <div className="h-screen w-full relative overflow-hidden bg-dark-900 flex flex-col">
            {/* Background Images with Transitions */}
            {slides.map((slide, index) => (
                <div 
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={slide.bg} alt="bg" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-dark-900/40 via-dark-900/80 to-dark-900"></div>
                </div>
            ))}

            {/* Content Area */}
            <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-12 sm:pb-16 max-w-md mx-auto w-full">
                
                {/* Visual Demo Area (Center) */}
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    {activeSlide.visual ? (
                        <div className="animate-fade-in-up">
                            {activeSlide.visual}
                        </div>
                    ) : (
                        // Hero Slide Visual (Logo or Empty)
                        <div className="animate-fade-in-up flex flex-col items-center">
                             <div className="w-20 h-20 bg-vital-500 rounded-2xl rotate-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                             </div>
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div className="space-y-4 mb-8 min-h-[140px]">
                    <div className="animate-fade-in">
                        <h3 className="text-vital-400 font-bold uppercase tracking-widest text-xs mb-2">{activeSlide.title}</h3>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-3">
                            {activeSlide.subtitle}
                        </h1>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            {activeSlide.desc}
                        </p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-8">
                    {slides.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-vital-500' : 'w-2 bg-gray-600 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3">
                    {currentSlide < slides.length - 1 ? (
                        <button 
                            onClick={() => setCurrentSlide(curr => curr + 1)}
                            className="w-full bg-white text-dark-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            {t('onboarding.next')}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setViewState('REGISTER')}
                            className="w-full bg-vital-600 text-white font-bold py-4 rounded-xl hover:bg-vital-500 transition-colors shadow-lg shadow-vital-500/20"
                        >
                            {t('onboarding.getStarted')}
                        </button>
                    )}
                    
                    <div className="flex justify-center mt-2">
                        <button 
                            onClick={() => setViewState('LOGIN')} 
                            className="text-gray-400 text-sm font-medium hover:text-white px-4 py-2"
                        >
                            {t('onboarding.haveAccount')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- AUTH FORMS VIEW ---

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-dark-900">
      {/* Background Ambience for Forms */}
      <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-30 blur-sm" alt="bg" />
          <div className="absolute inset-0 bg-dark-900/80"></div>
      </div>
      
      {viewState === 'LOGIN' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { MacroRing } from '../components/MacroRing';
import { View } from '../types';
import { generateContextPill, generateImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { stats, userProfile } = useFitness();
  const [contextPill, setContextPill] = useState<string>(t('dashboard.loadingPill'));
  const [bgImage, setBgImage] = useState<string>("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop");
  const [greeting, setGreeting] = useState('');
  
  // Interaction States
  const [isListening, setIsListening] = useState(false);
  const [showVoiceToast, setShowVoiceToast] = useState(false);

  // Re-fetch context pill when language changes
  useEffect(() => {
    setContextPill(t('dashboard.loadingPill'));
    generateContextPill(language).then(setContextPill);
  }, [language, t]);

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.greetingMorning'));
    else if (hour < 18) setGreeting(t('dashboard.greetingAfternoon'));
    else setGreeting(t('dashboard.greetingEvening'));
  }, [t]);

  // Load or generate dynamic background
  useEffect(() => {
      const loadBackground = async () => {
          const cached = localStorage.getItem('vital_dashboard_bg_v2');
          if (cached) {
              setBgImage(cached);
              return;
          }

          try {
              const prompt = "Abstract cinematic 3d render representing fitness progress and energy, dark moody atmosphere with neon green and teal light trails, dynamic composition, high resolution, 8k, minimalist data visualization style";
              const img = await generateImage(prompt);
              setBgImage(img);
              localStorage.setItem('vital_dashboard_bg_v2', img);
          } catch (e) {
              console.error("Failed to generate dashboard bg", e);
          }
      };

      loadBackground();
  }, []);

  // Simulating Voice Log
  const handleVoiceLog = () => {
      setIsListening(true);
      setTimeout(() => {
          setIsListening(false);
          setShowVoiceToast(true);
          setTimeout(() => setShowVoiceToast(false), 3000);
      }, 2000);
  };

  // Pulse Status Logic
  const pulseStatus = stats.recoveryScore > 70 ? 'high' : stats.recoveryScore < 40 ? 'low' : 'normal';

  return (
    <div className="min-h-full pb-24 relative overflow-hidden flex flex-col">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <img 
            src={bgImage} 
            alt="Dashboard" 
            className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-900/90 to-dark-900"></div>
      </div>

      <div className="relative z-10 px-4 pt-4 space-y-6 flex-1 flex flex-col">
          
          {/* 1. Header & Greeting */}
          <div className="flex justify-between items-start animate-fade-in-up">
              <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{greeting}, {userProfile.name?.split(' ')[0] || 'Athlete'}</h1>
                  <p className="text-sm text-gray-400 font-medium">{t('dashboard.subtitle')}</p>
              </div>
              
              {/* Gamification: Streak Badge */}
              <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                      <span className="text-base">🔥</span>
                      <span className="text-sm font-bold text-orange-400">5</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">{t('dashboard.streak')}</span>
              </div>
          </div>

          {/* 2. Context Pill (Coach Message) */}
          <div 
              onClick={() => onNavigate(View.COACH)}
              className="animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
          >
              <div className="bg-dark-800/60 backdrop-blur-md border border-dark-700/50 p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-dark-800/80 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vital-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-vital-500/20">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                          {t('dashboard.insight')}
                          <span className="text-vital-500 group-hover:translate-x-1 transition-transform">→</span>
                      </p>
                      <p className="text-sm text-gray-200 leading-snug font-medium">"{contextPill}"</p>
                  </div>
              </div>
          </div>

          {/* 3. The "Flow Pulse" Centerpiece */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 animate-fade-in relative">
              <div className="relative" onClick={() => onNavigate(View.NUTRITION)}>
                  <MacroRing 
                    current={stats.caloriesConsumed} 
                    target={stats.caloriesTarget} 
                    color="#10b981" 
                    label={t('dashboard.kcal')} 
                    size="xl" 
                    pulseStatus={pulseStatus}
                  />
                  
                  {/* Floating Voice Action Button */}
                  <button 
                      onClick={(e) => { e.stopPropagation(); handleVoiceLog(); }}
                      disabled={isListening}
                      className={`absolute -bottom-4 right-0 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
                          isListening 
                          ? 'bg-red-500 animate-pulse text-white' 
                          : 'bg-dark-800 text-vital-500 border border-dark-700 hover:border-vital-500'
                      }`}
                  >
                      {isListening ? (
                           <span className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                      ) : (
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      )}
                  </button>
              </div>

              {/* Voice Status Text */}
              <div className="mt-8 h-6 text-center">
                  {isListening && <p className="text-sm font-bold text-red-400 animate-pulse">{t('dashboard.listening')}</p>}
                  {!isListening && !showVoiceToast && <p className="text-xs text-gray-500">{t('dashboard.voiceLog')}</p>}
                  {showVoiceToast && (
                      <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full animate-fade-in-up">
                          {t('dashboard.voiceSuccess')}
                      </div>
                  )}
              </div>
          </div>

          {/* 4. Secondary Widgets Grid */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Recovery */}
              <div className="bg-dark-800/80 backdrop-blur-sm p-4 rounded-2xl border border-dark-700 flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl -mr-6 -mt-6 ${stats.recoveryScore > 70 ? 'bg-green-500/20' : 'bg-red-500/20'}`}></div>
                  <div className="flex justify-between items-start relative z-10">
                      <span className="text-xs text-gray-400 font-bold uppercase">{t('dashboard.recovery')}</span>
                  </div>
                  <div className="relative z-10">
                      <span className={`text-3xl font-bold ${stats.recoveryScore > 70 ? 'text-white' : 'text-red-400'}`}>{stats.recoveryScore}%</span>
                      <p className="text-[10px] text-gray-500 mt-1">{t('dashboard.recoveryDesc')}</p>
                  </div>
                  {/* Small Trend Line (Visual) */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-700">
                      <div className={`h-full ${stats.recoveryScore > 70 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${stats.recoveryScore}%` }}></div>
                  </div>
              </div>

              {/* Training */}
              <div 
                  onClick={() => onNavigate(View.TRAINING)}
                  className="bg-gradient-to-br from-vital-900/80 to-dark-800 p-4 rounded-2xl border border-vital-500/20 flex flex-col justify-between h-32 cursor-pointer group relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-vital-500/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-vital-500/20 transition-colors"></div>
                  <div className="flex justify-between items-start relative z-10">
                      <span className="text-xs text-gray-300 font-bold uppercase">{t('dashboard.nextUp')}</span>
                  </div>
                  <div className="relative z-10">
                      <span className="text-lg font-bold text-white block leading-tight">{t('dashboard.pushDay')}</span>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-vital-400 font-bold uppercase tracking-wide">
                          {t('dashboard.startWorkout')}
                          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                  </div>
              </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 pb-2">
               <div className="bg-dark-800/50 p-2 rounded-xl text-center border border-dark-700/50">
                    <span className="block text-blue-400 font-bold text-lg">{stats.proteinConsumed}</span>
                    <span className="text-[9px] text-gray-500 uppercase">{t('dashboard.prot')}</span>
               </div>
               <div className="bg-dark-800/50 p-2 rounded-xl text-center border border-dark-700/50">
                    <span className="block text-yellow-400 font-bold text-lg">{stats.carbsConsumed}</span>
                    <span className="text-[9px] text-gray-500 uppercase">{t('dashboard.carb')}</span>
               </div>
               <div className="bg-dark-800/50 p-2 rounded-xl text-center border border-dark-700/50">
                    <span className="block text-red-400 font-bold text-lg">{stats.fatsConsumed}</span>
                    <span className="text-[9px] text-gray-500 uppercase">{t('dashboard.fat')}</span>
               </div>
          </div>
      </div>
    </div>
  );
};

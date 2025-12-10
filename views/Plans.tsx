
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../types';
import { generateImage } from '../services/geminiService';

interface PlansProps {
  onNavigate: (view: View) => void;
}

// Keys for themes to allow localization while keeping English prompts for the AI
const THEME_KEYS = ['upwardProgress', 'explosiveEnergy', 'focusedDiscipline', 'endurancePath', 'mentalClarity'];

const THEME_PROMPTS: Record<string, string> = {
    upwardProgress: 'continuous upward growth and reaching peaks',
    explosiveEnergy: 'explosive kinetic energy and raw power',
    focusedDiscipline: 'unbreakable discipline, steel focus, grinding in the gym',
    endurancePath: 'long distance path and infinite stamina',
    mentalClarity: 'perfect mental balance and zen clarity'
};

interface Plan {
    id: number;
    name: string;
    active: boolean;
    duration: number;
    workoutsPerWeek: number;
}

export const Plans: React.FC<PlansProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  
  const [plans, setPlans] = useState<Plan[]>([
    { id: 1, name: 'Hypertrophy Push/Pull', active: true, duration: 8, workoutsPerWeek: 4 },
    { id: 2, name: 'Strength 5x5', active: false, duration: 12, workoutsPerWeek: 3 },
    { id: 3, name: 'Summer Shred', active: false, duration: 6, workoutsPerWeek: 5 },
  ]);

  // Default fallback image
  const [bgImage, setBgImage] = useState<string>("https://images.unsplash.com/photo-1552674605-46d53161652c?q=80&w=2070&auto=format&fit=crop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentThemeKey, setCurrentThemeKey] = useState<string>('');
  
  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Sync translations while preserving active state
  useEffect(() => {
    setPlans(prevPlans => [
        { ...prevPlans.find(p => p.id === 1)!, name: t('plans.plan1'), duration: 8, workoutsPerWeek: 4 },
        { ...prevPlans.find(p => p.id === 2)!, name: t('plans.plan2'), duration: 12, workoutsPerWeek: 3 },
        { ...prevPlans.find(p => p.id === 3)!, name: t('plans.plan3'), duration: 6, workoutsPerWeek: 5 },
    ]);
  }, [language, t]);

  const generateBackground = async () => {
    setIsGenerating(true);
    try {
        // Pick a random key different from current if possible
        let availableKeys = THEME_KEYS;
        if (currentThemeKey) {
             availableKeys = THEME_KEYS.filter(k => k !== currentThemeKey);
        }
        const themeKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        setCurrentThemeKey(themeKey);
        
        // Use English prompt for Gemini
        const englishTheme = THEME_PROMPTS[themeKey];
        const prompt = `Abstract 3D concept art representing a fitness journey of ${englishTheme}, depicting forward momentum, growth and strength. Ethereal glowing path, dark moody premium gym atmosphere with emerald green lighting accents, cinematic composition, 8k resolution, minimalist data visualization elements overlay.`;
        
        const img = await generateImage(prompt);
        setBgImage(img);
        localStorage.setItem('vital_plans_bg_v6', img);
        localStorage.setItem('vital_plans_theme_key_v6', themeKey);
    } catch (e) {
        console.error("Failed to generate bg", e);
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    const loadBackground = async () => {
        const cached = localStorage.getItem('vital_plans_bg_v6');
        const cachedThemeKey = localStorage.getItem('vital_plans_theme_key_v6');
        
        if (cached) {
            setBgImage(cached);
            if (cachedThemeKey) setCurrentThemeKey(cachedThemeKey);
            return;
        }
        await generateBackground();
    };

    loadBackground();
  }, []);

  const handlePlanClick = (plan: Plan) => {
      if (plan.active) {
          setSelectedPlan(plan);
          setShowCompleteModal(true);
      } else {
          onNavigate(View.PLAN_EDITOR);
      }
  };

  const handleMarkComplete = () => {
      if (selectedPlan) {
          setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, active: false } : p));
          setShowCompleteModal(false);
          setSelectedPlan(null);
      }
  };

  const handleContinue = () => {
      setShowCompleteModal(false);
      onNavigate(View.PLAN_EDITOR);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Gradient Overlay */}
      <div className="fixed inset-0 z-0 transition-opacity duration-1000">
         <img 
            src={bgImage} 
            alt={t('plans.bgAlt')}
            className={`w-full h-full object-cover transition-all duration-1000 ${isGenerating ? 'opacity-30 blur-md scale-105' : 'opacity-25 blur-0 scale-100'}`}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/95 to-dark-900"></div>
      </div>
      
      {/* Plan Completion Modal */}
      {showCompleteModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)}></div>
            <div className="bg-dark-800 border border-dark-700 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl animate-fade-in-up">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-vital-500/20 text-vital-500 rounded-full flex items-center justify-center mb-3">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">{t('plans.completeModalTitle')}</h3>
                    <p className="text-gray-400 text-sm mt-2">{t('plans.completeModalDesc')}</p>
                </div>
                
                <div className="space-y-3">
                    <button 
                        onClick={handleContinue}
                        className="w-full bg-vital-600 hover:bg-vital-500 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-vital-900/40"
                    >
                        {t('plans.continuePlan')}
                    </button>
                    <button 
                        onClick={handleMarkComplete}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-gray-300 py-3.5 rounded-xl font-bold transition-colors border border-dark-600"
                    >
                        {t('plans.markComplete')}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="relative z-10 p-4 space-y-6 pb-24 h-full flex flex-col">
        <header className="mt-2 flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">{t('plans.title')}</h1>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-300 drop-shadow">{t('plans.subtitle')}</p>
                    {currentThemeKey && (
                        <span className="text-[10px] bg-dark-800/50 px-2 py-0.5 rounded-full border border-white/10 text-gray-400 animate-fade-in">
                            {t(`plans.themes.${currentThemeKey}`)}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={generateBackground}
                    disabled={isGenerating}
                    className={`bg-dark-800/50 hover:bg-dark-700 text-gray-300 p-3 rounded-full shadow-lg border border-white/10 transition-all ${isGenerating ? 'animate-spin text-vital-500' : ''}`}
                    title={t('plans.regenerateBg')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button 
                    onClick={() => onNavigate(View.PLAN_EDITOR)}
                    className="bg-vital-600 hover:bg-vital-500 text-white p-3 rounded-full shadow-lg shadow-vital-900/40 transition-transform active:scale-95 border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
        </header>

        <div className="space-y-4">
            {plans.map((plan) => (
                <div 
                    key={plan.id} 
                    onClick={() => handlePlanClick(plan)}
                    className="bg-dark-800/80 backdrop-blur-md rounded-2xl border border-dark-700/50 p-5 relative overflow-hidden group transition-all duration-300 hover:border-vital-500/40 hover:bg-dark-800/90 hover:shadow-xl hover:shadow-vital-500/5 cursor-pointer hover:-translate-y-1"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-vital-500 transition-colors">{plan.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                    {plan.active ? t('plans.active') : t('plans.inactive')}
                                </span>
                            </div>
                        </div>
                        <button className="text-gray-500 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-dark-900/50 rounded-lg p-3 group-hover:bg-dark-900/80 transition-colors">
                            <span className="block text-2xl font-bold text-white">{plan.duration}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-medium">{t('plans.weeks')}</span>
                        </div>
                        <div className="bg-dark-900/50 rounded-lg p-3 group-hover:bg-dark-900/80 transition-colors">
                            <span className="block text-2xl font-bold text-white">{plan.workoutsPerWeek}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-medium">{t('plans.perWeek')}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';

export const Training: React.FC = () => {
  const { t } = useLanguage();
  const { exercises, updateExercise, trainingPlanName, dailyFocus } = useFitness();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const toggleComplete = (id: string) => {
    const ex = exercises.find(e => e.id === id);
    if (ex) {
        updateExercise(id, { completed: !ex.completed });
    }
  };

  // Helper to map default exercise data to translations
  const getLocalizedExerciseName = (id: string, originalName: string) => {
      switch(id) {
          case '1': return t('training.ex1');
          case '2': return t('training.ex2');
          case '3': return t('training.ex3');
          case '4': return t('training.ex4');
          case '5': return t('training.ex5');
          case '6': return t('training.ex6');
          default: return originalName;
      }
  };
  
  // Dynamic technique tips based on exercise ID
  const getTechniqueTip = (id: string) => {
      switch(id) {
          case '1': return "Drž lokty pod úhlem 45°, kontrolovaná negativní fáze.";
          case '2': return "Nezamykej lokty nahoře, udržuj stálé napětí v ramenou.";
          case '3': return "Soustřeď se na protažení prsních svalů, nechoď do bolesti.";
          case '4': return "Lokty mírně pokrčené, pohyb vychází z ramen, ne z trapézů.";
          case '5': return "Náklon dopředu pro zapojení prsou, svisle pro triceps.";
          case '6': return "Lokty u těla, v dolní pozici roztáhni lano od sebe.";
          default: return "Soustřeď se na dýchání a plný rozsah pohybu.";
      }
  };

  // Localize the default plan name if it hasn't been changed
  const displayPlanName = trainingPlanName === 'Push Hypertrophy' 
      ? t('training.title') 
      : trainingPlanName;

  const isRecovery = dailyFocus === 'Recovery';

  // Stats Calculations
  const completedCount = exercises.filter(e => e.completed).length;
  const progressPercent = Math.round((completedCount / exercises.length) * 100);
  
  // Calculate Volume (approximate for display)
  const totalVolume = exercises.reduce((acc, ex) => {
      const weightVal = parseInt(ex.weight.replace(/[^0-9]/g, '')) || 0;
      const repsVal = parseInt(ex.reps.split('-')[0]) || 0;
      return acc + (ex.sets * repsVal * weightVal);
  }, 0);

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 mt-2 mb-2">
        <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white transition-all leading-tight">{displayPlanName}</h1>
              <p className="text-sm text-gray-400">{t('training.subtitle')}</p>
            </div>
            <button className={`${isRecovery ? 'bg-blue-600 hover:bg-blue-500' : 'bg-vital-600 hover:bg-vital-500'} text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-lg shadow-vital-900/20`}>
              {t('training.finish')}
            </button>
        </div>

        {/* Progress & Stats Bar */}
        {!isRecovery && (
            <div className="bg-dark-800 rounded-xl p-3 border border-dark-700">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">
                    <span>{t('training.progress')}</span>
                    <span className="text-vital-500">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-dark-900 rounded-full overflow-hidden mb-3">
                    <div 
                        className="h-full bg-vital-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between border-t border-dark-700 pt-2">
                    <div className="text-center w-1/2 border-r border-dark-700">
                        <span className="block text-white font-bold text-lg">{Math.round(totalVolume / 1000)}k</span>
                        <span className="text-[10px] text-gray-500 uppercase">{t('training.volume')} (kg)</span>
                    </div>
                    <div className="text-center w-1/2">
                        <span className="block text-white font-bold text-lg">~55</span>
                        <span className="text-[10px] text-gray-500 uppercase">{t('training.time')} (min)</span>
                    </div>
                </div>
            </div>
        )}
      </header>

      {/* AI Adaptation Banner */}
      {isRecovery && (
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                  <h3 className="text-sm font-bold text-blue-400">AI Adaptation Active</h3>
                  <p className="text-xs text-gray-300 mt-1">Based on your low recovery score, I've swapped your heavy lifts for a mobility and blood-flow session.</p>
              </div>
          </div>
      )}

      <div className="space-y-3">
        {exercises.map((ex, index) => (
          <div 
            key={ex.id} 
            className={`bg-dark-800 rounded-2xl overflow-hidden border transition-all duration-300 ${
                activeExercise === ex.id 
                ? (isRecovery ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-lg' : 'border-vital-500 ring-1 ring-vital-500/20 shadow-lg shadow-vital-900/10')
                : 'border-dark-700'
            }`}
          >
            <div 
                className="p-4 flex items-center justify-between cursor-pointer group"
                onClick={() => setActiveExercise(activeExercise === ex.id ? null : ex.id)}
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-dark-700 group-hover:bg-vital-600 transition-colors ${activeExercise === ex.id ? 'bg-vital-500' : ''}`}></div>
                        <div 
                            onClick={(e) => { e.stopPropagation(); toggleComplete(ex.id); }}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ml-2 ${
                                ex.completed 
                                ? (isRecovery ? 'bg-blue-500 border-blue-500 text-white' : 'bg-vital-500 border-vital-500 text-dark-900')
                                : 'border-gray-500 hover:border-gray-300'
                            }`}
                        >
                            {ex.completed ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <span className="text-[10px] font-bold text-gray-500">{index + 1}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg leading-tight ${ex.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                            {getLocalizedExerciseName(ex.id, ex.name)}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            <span className="text-gray-300">{ex.sets} {t('training.sets')}</span> 
                            <span className="mx-1.5 opacity-30">|</span> 
                            <span className="text-gray-300">{ex.reps}</span> 
                            <span className="mx-1.5 opacity-30">|</span> 
                            <span className="text-vital-500">{ex.weight}</span>
                        </p>
                    </div>
                </div>
                <div className={`bg-dark-700/50 p-1.5 rounded-full transition-transform duration-300 ${activeExercise === ex.id ? 'rotate-180 bg-vital-500/10 text-vital-500' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {/* Expanded Details */}
            {activeExercise === ex.id && (
                <div className="px-4 pb-4 pt-0 bg-dark-800 border-t border-dark-700/50 animate-fade-in">
                    
                    {/* Pro Tip Box */}
                    <div className="mt-3 bg-vital-500/5 border-l-2 border-vital-500 p-2.5 rounded-r-lg mb-4">
                        <p className="text-xs text-gray-300 italic flex gap-2">
                            <span className="font-bold text-vital-500 not-italic uppercase text-[10px] tracking-wider">{t('training.formTips')}:</span>
                            {getTechniqueTip(ex.id)}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-2 text-center text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                        <span>{t('training.set')}</span>
                        <span>{t('training.kg')}</span>
                        <span>{t('training.reps')}</span>
                        <span>{t('training.rpe')}</span>
                    </div>
                    
                    {[...Array(ex.sets)].map((_, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                            <div className="flex items-center justify-center bg-dark-900 rounded-lg h-10 text-gray-400 font-bold border border-dark-700/50">{i + 1}</div>
                            <input type="text" placeholder={ex.weight.replace('kg', '')} className="bg-dark-900 rounded-lg h-10 text-center text-white focus:ring-1 focus:ring-vital-500 outline-none border border-dark-700/50 font-bold" />
                            <input type="text" placeholder={ex.reps.split('-')[1] || ex.reps} className="bg-dark-900 rounded-lg h-10 text-center text-white focus:ring-1 focus:ring-vital-500 outline-none border border-dark-700/50 font-bold" />
                            <input type="text" placeholder="8" className="bg-dark-900 rounded-lg h-10 text-center text-gray-400 focus:ring-1 focus:ring-vital-500 focus:text-white outline-none border border-dark-700/50" />
                        </div>
                    ))}
                    
                    <div className="mt-4 flex gap-2">
                         <button className="flex-1 bg-dark-700 hover:bg-dark-600 py-2.5 rounded-lg text-xs font-bold text-gray-300 transition-colors border border-dark-600">{t('training.history')}</button>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

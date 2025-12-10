
import React, { useRef, useState, useEffect } from 'react';
import { analyzeFoodImage, generateNutritionPlan, verifyNutritionFact, generateGroceryList } from '../services/geminiService';
import { MacroData, NutritionPlan, GroceryItem, NutritionLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';

export const Nutrition: React.FC = () => {
  const { t, language } = useLanguage();
  const { userProfile, updateStats, dailyFocus, trainingPlanName, stats, addNutritionLog, nutritionLogs } = useFitness();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'LOG' | 'STRATEGY' | 'SHOP'>('STRATEGY');

  // Logging State
  const [analyzing, setAnalyzing] = useState(false);
  const [scannedData, setScannedData] = useState<{data: MacroData, name: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Strategy State
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [tempSleep, setTempSleep] = useState<number>(6);
  
  // Shop State
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [generatingList, setGeneratingList] = useState(false);

  // Fact Check State
  const [factQuery, setFactQuery] = useState('');
  const [factResult, setFactResult] = useState<string | null>(null);
  const [checkingFact, setCheckingFact] = useState(false);

  // Dynamic Context Construction
  const derivedContext = `
    Today's Training Focus: ${dailyFocus}
    Specific Plan: ${trainingPlanName}
    Current Recovery Score: ${stats.recoveryScore}%
    Sleep Duration: ${stats.sleepHours ? stats.sleepHours + 'h' : 'Unknown'}
    Goal: ${userProfile.goal}
  `;

  // Auto-load plan only if we have sleep data
  useEffect(() => {
      if (activeTab === 'STRATEGY' && stats.sleepHours !== undefined) {
          if (!plan) {
            handleGeneratePlan();
          }
      }
  }, [activeTab, stats.sleepHours]);

  const handleUpdateSleepAndGenerate = () => {
      updateStats({ sleepHours: tempSleep });
      
      const manualContext = `
        Today's Training Focus: ${dailyFocus}
        Specific Plan: ${trainingPlanName}
        Current Recovery Score: ${stats.recoveryScore}%
        Sleep Duration: ${tempSleep}h
        Goal: ${userProfile.goal}
      `;
      
      generatePlanWithContext(manualContext);
  };

  const generatePlanWithContext = async (ctx: string) => {
      setLoadingPlan(true);
      try {
          // Append instruction to explain sleep impact
          const enhancedContext = ctx + "\nIMPORTANT: Explain clearly how the sleep duration impacted the calorie and macro targets.";
          
          const generatedPlan = await generateNutritionPlan(userProfile, enhancedContext, language);
          setPlan(generatedPlan);
          
          updateStats({
              caloriesTarget: generatedPlan.targetCalories,
              proteinTarget: generatedPlan.targetProtein,
              carbsTarget: generatedPlan.targetCarbs,
              fatsTarget: generatedPlan.targetFats
          });
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingPlan(false);
      }
  }

  const handleGeneratePlan = async () => {
      // Use the derivedContext which uses the state sleepHours
      if (stats.sleepHours === undefined) return;
      generatePlanWithContext(derivedContext);
  };
  
  const handleGenerateGroceryList = async () => {
      if (!plan) return;
      setGeneratingList(true);
      try {
          const items = await generateGroceryList(plan, language);
          setGroceryList(items);
      } catch (e) {
          console.error(e);
      } finally {
          setGeneratingList(false);
      }
  };

  const toggleGroceryItem = (idx: number) => {
      const newList = [...groceryList];
      newList[idx].checked = !newList[idx].checked;
      setGroceryList(newList);
  };

  const handleFactCheck = async () => {
      if (!factQuery.trim()) return;
      setCheckingFact(true);
      const result = await verifyNutritionFact(factQuery, language);
      setFactResult(result);
      setCheckingFact(false);
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setScannedData(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; 

      try {
        const result = await analyzeFoodImage(base64Data, language);
        setScannedData({
            name: result.foodName,
            data: {
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fats: result.fats
            }
        });
      } catch (err) {
        setError(t('nutrition.analysisError'));
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogMeal = () => {
      if (!scannedData) return;

      const newLog: NutritionLog = {
          id: Date.now().toString(),
          foodName: scannedData.name,
          calories: scannedData.data.calories,
          protein: scannedData.data.protein,
          carbs: scannedData.data.carbs,
          fats: scannedData.data.fats,
          timestamp: Date.now(),
      };

      addNutritionLog(newLog);
      setScannedData(null); // Clear result
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      
      {/* Header & Tabs */}
      <header className="p-4 bg-dark-900 border-b border-dark-800 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-2xl font-bold text-white">{t('nutrition.title')}</h1>
                <p className="text-xs text-gray-400">{t('nutrition.subtitle')}</p>
            </div>
            {activeTab === 'STRATEGY' && stats.sleepHours !== undefined && (
                <button 
                    onClick={handleGeneratePlan}
                    disabled={loadingPlan}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${loadingPlan ? 'animate-spin bg-dark-800 text-vital-500' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            )}
        </div>

        <div className="grid grid-cols-3 gap-1 bg-dark-800 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('STRATEGY')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'STRATEGY' ? 'bg-vital-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
                {t('nutrition.tabStrategy')}
            </button>
            <button 
                onClick={() => setActiveTab('LOG')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'LOG' ? 'bg-vital-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
                {t('nutrition.tabLog')}
            </button>
            <button 
                onClick={() => setActiveTab('SHOP')}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${activeTab === 'SHOP' ? 'bg-vital-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
                {t('nutrition.tabShop')}
                {/* Pro Badge */}
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400"></span>
            </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* === STRATEGY VIEW === */}
        {activeTab === 'STRATEGY' && (
            <div className="space-y-6 animate-fade-in">
                
                {/* Sleep Input Card - Show if sleep is undefined */}
                {stats.sleepHours === undefined && (
                    <div className="bg-gradient-to-br from-indigo-900/50 to-dark-800 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                {t('nutrition.sleepTitle')}
                            </h3>
                            <p className="text-sm text-gray-300 mb-4">{t('nutrition.sleepMissing')}</p>
                            
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('nutrition.sleepAsk')}</label>
                            <div className="flex gap-3">
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="12" 
                                    value={tempSleep}
                                    onChange={(e) => setTempSleep(parseFloat(e.target.value))}
                                    className="w-20 bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-center text-white font-bold focus:border-indigo-500 outline-none"
                                />
                                <button 
                                    onClick={handleUpdateSleepAndGenerate}
                                    disabled={loadingPlan}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    {loadingPlan ? '...' : t('nutrition.sleepSave')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loadingPlan ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="relative w-20 h-20">
                             <div className="absolute inset-0 border-4 border-dark-700 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-vital-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-vital-500 font-medium animate-pulse">{t('nutrition.generatingPlan')}</p>
                    </div>
                ) : plan ? (
                    <>
                        {/* Macro Targets */}
                        <div className="bg-dark-800 rounded-3xl p-6 border border-dark-700 shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-vital-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                             
                             <div className="relative z-10 text-center mb-6">
                                 <h2 className="text-4xl font-bold text-white tracking-tight">{plan.targetCalories}</h2>
                                 <p className="text-xs uppercase tracking-widest text-vital-500 font-bold mt-1">{t('dashboard.kcal')} {t('nutrition.strategyTitle')}</p>
                             </div>

                             <div className="grid grid-cols-3 gap-3 relative z-10">
                                 <div className="bg-dark-900/50 p-3 rounded-2xl text-center">
                                     <span className="block text-xl font-bold text-blue-400">{plan.targetProtein}g</span>
                                     <span className="text-[10px] text-gray-500 font-bold uppercase">{t('dashboard.prot')}</span>
                                 </div>
                                 <div className="bg-dark-900/50 p-3 rounded-2xl text-center">
                                     <span className="block text-xl font-bold text-yellow-400">{plan.targetCarbs}g</span>
                                     <span className="text-[10px] text-gray-500 font-bold uppercase">{t('dashboard.carb')}</span>
                                 </div>
                                 <div className="bg-dark-900/50 p-3 rounded-2xl text-center">
                                     <span className="block text-xl font-bold text-red-400">{plan.targetFats}g</span>
                                     <span className="text-[10px] text-gray-500 font-bold uppercase">{t('dashboard.fat')}</span>
                                 </div>
                             </div>
                        </div>

                        {/* Reasoning "The Why" */}
                        <div className="bg-dark-800/50 border border-vital-500/30 rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs uppercase font-bold text-vital-500 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {t('nutrition.theWhy')}
                                </h3>
                                {/* Show sleep context if available */}
                                {stats.sleepHours && (
                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                        Sleep: {stats.sleepHours}h
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {plan.reasoning}
                            </p>
                        </div>

                        {/* Meal Timing */}
                        <div>
                            <h3 className="text-sm font-bold text-white mb-3 pl-1">{t('nutrition.mealTiming')}</h3>
                            <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-700">
                                {plan.mealTiming.map((meal, idx) => (
                                    <div key={idx} className="relative flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 border-2 border-dark-600 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0 z-10">
                                            {meal.time}
                                        </div>
                                        <div className="bg-dark-800 p-3 rounded-xl border border-dark-700 flex-1">
                                            <h4 className="text-xs font-bold text-vital-400 uppercase mb-1">{meal.label}</h4>
                                            <p className="text-sm text-gray-300">{meal.suggestion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Supplements */}
                        <div>
                             <h3 className="text-sm font-bold text-white mb-3 pl-1">{t('nutrition.supplements')}</h3>
                             <div className="grid grid-cols-2 gap-3">
                                 {plan.supplements.map((supp, idx) => (
                                     <div key={idx} className="bg-dark-800 p-3 rounded-xl border border-dark-700">
                                         <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-white text-sm">{supp.name}</span>
                                            <span className="bg-dark-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">{supp.dosage}</span>
                                         </div>
                                         <p className="text-[10px] text-gray-500">{supp.reason}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </>
                ) : null}

                 {/* Fact Check */}
                 <div className="bg-gradient-to-br from-indigo-900/40 to-dark-800 p-5 rounded-2xl border border-indigo-500/30 mt-4">
                    <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t('nutrition.factCheckTitle')}
                    </h3>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={factQuery}
                            onChange={(e) => setFactQuery(e.target.value)}
                            placeholder={t('nutrition.factCheckPlaceholder')}
                            className="flex-1 bg-dark-900 border border-indigo-900/50 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        />
                        <button 
                            onClick={handleFactCheck}
                            disabled={checkingFact || !factQuery.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {checkingFact ? '...' : t('nutrition.checkBtn')}
                        </button>
                    </div>
                    {factResult && (
                        <div className="mt-3 p-3 bg-dark-900/50 rounded-lg border border-indigo-500/20 text-xs text-gray-300 animate-fade-in">
                            <span className="font-bold text-indigo-400 block mb-1">{t('nutrition.verified')}:</span>
                            {factResult}
                        </div>
                    )}
                 </div>
            </div>
        )}

        {/* === LOG VIEW === */}
        {activeTab === 'LOG' && (
            <div className="space-y-6 animate-fade-in">
                {/* Main Action Card */}
                <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-vital-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-vital-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">{t('nutrition.snapTitle')}</h2>
                        <p className="text-sm text-gray-400 mb-6">{t('nutrition.snapDesc')}</p>
                        
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={analyzing}
                            className="w-full py-4 bg-vital-600 hover:bg-vital-500 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {analyzing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {t('nutrition.analyzing')}
                                </>
                            ) : (
                                t('nutrition.openCamera')
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center text-sm">
                        {error}
                    </div>
                )}

                {/* Result Card */}
                {scannedData && (
                    <div className="bg-dark-800 border border-vital-500/30 rounded-2xl p-4 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-white mb-1">{scannedData.name}</h3>
                        <p className="text-xs text-vital-500 font-medium mb-4">{t('nutrition.analysisComplete')}</p>
                        
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <div className="bg-dark-900 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-white">{scannedData.data.calories}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{t('dashboard.kcal')}</span>
                            </div>
                            <div className="bg-dark-900 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-blue-400">{scannedData.data.protein}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{t('dashboard.prot')}</span>
                            </div>
                            <div className="bg-dark-900 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-yellow-400">{scannedData.data.carbs}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{t('dashboard.carb')}</span>
                            </div>
                            <div className="bg-dark-900 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-red-400">{scannedData.data.fats}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{t('dashboard.fat')}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setScannedData(null)}
                                className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 py-3 rounded-xl font-medium transition-colors"
                            >
                                {t('nutrition.discard')}
                            </button>
                            <button 
                                onClick={handleLogMeal}
                                className="flex-1 bg-vital-600 hover:bg-vital-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-vital-900/20"
                            >
                                {t('nutrition.logMeal')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">{t('nutrition.recentLogs')}</h3>
                    <div className="space-y-3">
                        {nutritionLogs.map(log => (
                            <div key={log.id} className="flex justify-between items-center p-3 bg-dark-800 rounded-xl border border-dark-700 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-gray-600">
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{log.foodName}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(log.timestamp).toLocaleTimeString(language === 'cs' ? 'cs-CZ' : 'en-US', {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-vital-500">{log.calories} {t('dashboard.kcal')}</span>
                                    <span className="text-[10px] text-gray-500">{log.protein}p • {log.carbs}c • {log.fats}f</span>
                                </div>
                            </div>
                        ))}
                        {nutritionLogs.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-4">No meals logged today.</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* === SHOP VIEW (NEW PREMIUM FEATURE) === */}
        {activeTab === 'SHOP' && (
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-900/60 to-dark-800 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                             <h2 className="text-xl font-bold text-white mb-1">{t('nutrition.shopTitle')}</h2>
                             <p className="text-sm text-gray-400">{t('nutrition.shopDesc')}</p>
                        </div>
                        <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Pro</div>
                    </div>
                </div>

                {groceryList.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {/* Group by category logic visually handled by simple mapping for MVP */}
                            {Array.from(new Set(groceryList.map(item => item.category))).map(cat => (
                                <div key={cat} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                                    <div className="bg-dark-700/50 px-4 py-2 border-b border-dark-700 flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-gray-300 uppercase">{cat}</h3>
                                        <span className="text-[10px] bg-dark-600 px-1.5 rounded text-gray-400">
                                            {groceryList.filter(i => i.category === cat).length}
                                        </span>
                                    </div>
                                    <div className="p-2">
                                        {groceryList.map((item, idx) => {
                                            if (item.category !== cat) return null;
                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => toggleGroceryItem(groceryList.indexOf(item))}
                                                    className="flex items-center p-2 rounded-lg hover:bg-dark-700/50 cursor-pointer group"
                                                >
                                                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${item.checked ? 'bg-vital-500 border-vital-500' : 'border-gray-500 group-hover:border-vital-500'}`}>
                                                        {item.checked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <div className={`flex-1 ${item.checked ? 'opacity-50 line-through decoration-gray-500' : ''}`}>
                                                        <span className="text-sm text-gray-200">{item.item}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium">{item.quantity}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all">
                            <span>{t('nutrition.orderNow')}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </button>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-700">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        
                        {plan ? (
                            <button 
                                onClick={handleGenerateGroceryList}
                                disabled={generatingList}
                                className="bg-vital-600 hover:bg-vital-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {generatingList && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {generatingList ? t('nutrition.generatingList') : t('nutrition.generateList')}
                            </button>
                        ) : (
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">{t('nutrition.emptyShop')}</p>
                        )}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

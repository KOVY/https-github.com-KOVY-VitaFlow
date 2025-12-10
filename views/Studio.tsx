
import React, { useRef, useState } from 'react';
import { editImage, analyzeForm } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { FormAnalysis } from '../types';

export const Studio: React.FC = () => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mode State: 'EDIT' (Aesthetic) or 'FORM' (Analysis)
  const [mode, setMode] = useState<'EDIT' | 'FORM'>('FORM'); // Defaulting to Form for showcase
  const [formAnalysis, setFormAnalysis] = useState<FormAnalysis | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setGeneratedImage(null);
        setFormAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrompt(e.target.value);
      if (error) setError(null);
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim() || processing) return;

    setProcessing(true);
    setError(null);
    try {
        const base64Data = sourceImage.split(',')[1];
        const resultBase64 = await editImage(base64Data, prompt);
        setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (err) {
        console.error("Studio Edit Error:", err);
        setError(t('studio.error'));
    } finally {
        setProcessing(false);
    }
  };

  const handleAnalyzeForm = async () => {
      if (!sourceImage || processing) return;
      setProcessing(true);
      setError(null);
      try {
          const base64Data = sourceImage.split(',')[1];
          const analysis = await analyzeForm(base64Data, language);
          setFormAnalysis(analysis);
      } catch (err) {
          console.error("Analysis Error:", err);
          setError(t('studio.error'));
      } finally {
          setProcessing(false);
      }
  };

  return (
    <div className="relative min-h-full pb-20">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop" 
            alt="Studio Background" 
            className="w-full h-full object-cover opacity-20"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-dark-900/95 via-dark-900/80 to-dark-900"></div>
      </div>

      <div className="relative z-10 p-4 space-y-6 h-full flex flex-col">
        <header className="mt-2 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-white">{t('studio.title')}</h1>
                <p className="text-sm text-gray-400">{t('studio.subtitle')}</p>
            </div>
        </header>

        {/* Mode Switcher */}
        <div className="bg-dark-800/80 backdrop-blur-md p-1 rounded-xl flex gap-1 border border-dark-700/50">
            <button 
                onClick={() => setMode('EDIT')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'EDIT' ? 'bg-dark-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
                {t('studio.tabEdit')}
            </button>
            <button 
                onClick={() => setMode('FORM')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all relative ${mode === 'FORM' ? 'bg-vital-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
                {t('studio.tabForm')}
                {/* Pro Badge */}
                <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            </button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
            {/* Image Preview Area */}
            <div className="relative flex-1 bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden flex items-center justify-center min-h-[300px]">
                {generatedImage && mode === 'EDIT' ? (
                    <img src={generatedImage} alt="Edited" className="w-full h-full object-contain" />
                ) : sourceImage ? (
                    <div className="relative w-full h-full">
                        <img src={sourceImage} alt="Original" className="w-full h-full object-contain opacity-80" />
                        
                        {/* Form Analysis Overlay */}
                        {mode === 'FORM' && formAnalysis && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-4 rounded-t-2xl border-t border-vital-500/30 max-h-[60%] overflow-y-auto">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{formAnalysis.exerciseName}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${formAnalysis.safetyScore > 80 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {t('studio.safetyScore')}: {formAnalysis.safetyScore}/100
                                        </span>
                                    </div>
                                    <div className="h-10 w-10 rounded-full border-2 border-vital-500 flex items-center justify-center font-bold text-vital-500 text-sm">
                                        {formAnalysis.safetyScore}
                                    </div>
                                </div>
                                
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="text-green-400 font-bold text-xs uppercase mb-1">{t('studio.goodPoints')}</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            {formAnalysis.goodPoints.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-red-400 font-bold text-xs uppercase mb-1">{t('studio.improvements')}</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            {formAnalysis.improvements.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-dark-700/50 p-2 rounded-lg border-l-2 border-vital-500">
                                        <p className="text-gray-200 italic">"{formAnalysis.verdict}"</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="text-center cursor-pointer p-8">
                        <div className="w-16 h-16 bg-dark-700/80 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 border border-dark-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <p className="text-gray-400 font-medium">{t('studio.upload')}</p>
                    </div>
                )}
                
                {generatedImage && mode === 'EDIT' && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                        {t('studio.edited')}
                    </div>
                )}
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            {/* CONTROLS AREA */}
            {sourceImage && (
                <div className="bg-dark-800/80 backdrop-blur-md p-4 rounded-xl border border-dark-700/50 space-y-4 shadow-xl">
                    
                    {/* Mode: EDIT */}
                    {mode === 'EDIT' && !generatedImage && (
                        <div className="relative">
                            <input
                                type="text"
                                value={prompt}
                                onChange={handlePromptChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                placeholder={t('studio.placeholder')}
                                className={`w-full bg-dark-900/50 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-vital-500 border text-sm ${error ? 'border-red-500/50' : 'border-dark-700'}`}
                            />
                            <div className="absolute right-2 top-2 bottom-2">
                                <button 
                                    onClick={handleEdit}
                                    disabled={!prompt.trim() || processing}
                                    className="h-full px-4 bg-vital-600 hover:bg-vital-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                    {processing ? '...' : t('studio.go')}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Mode: FORM */}
                    {mode === 'FORM' && !formAnalysis && (
                        <button 
                            onClick={handleAnalyzeForm}
                            disabled={processing}
                            className="w-full py-3 bg-vital-600 hover:bg-vital-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-vital-900/40 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {t('studio.analyzing')}
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {t('studio.analyzeForm')}
                                </>
                            )}
                        </button>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 justify-center text-xs text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20 animate-pulse">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    {/* Reset Buttons */}
                    {(generatedImage || formAnalysis) && (
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => { setGeneratedImage(null); setFormAnalysis(null); }} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-xl font-medium transition-colors">{t('studio.reset')}</button>
                            {generatedImage && <a href={generatedImage} download="vitalflow-edit.jpg" className="flex-1 bg-vital-600 hover:bg-vital-500 text-white py-3 rounded-xl font-bold transition-colors text-center flex items-center justify-center">{t('studio.save')}</a>}
                            {formAnalysis && <button className="flex-1 bg-vital-600 hover:bg-vital-500 text-white py-3 rounded-xl font-bold transition-colors">{t('studio.save')}</button>}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

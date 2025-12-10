
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithCoach } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';

export const Coach: React.FC = () => {
  const { t, language } = useLanguage();
  const { stats, activateRecoveryMode, dailyFocus } = useFitness();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isDeepThinkEnabled, setIsDeepThinkEnabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize Chat based on Context
  useEffect(() => {
     if (hasInitialized.current) return;
     
     let initialMsg = "";
     
     if (stats.recoveryScore < 50 && dailyFocus !== 'Recovery') {
         initialMsg = language === 'cs' 
            ? `Všiml jsem si, že tvá regenerace je dnes nízká (${stats.recoveryScore}%). Mám upravit plán na aktivní regeneraci?`
            : `I've noticed your recovery score is critically low (${stats.recoveryScore}%) today. Should I switch your session to Active Recovery?`;
     } else {
         initialMsg = language === 'cs' 
            ? "Ahoj! Všiml jsem si včerejšího rekordu na dřepy. Jak se cítíš?" 
            : "Hey! I noticed you hit a new PR on squats yesterday. How are you feeling?";
     }

     setMessages([{
         id: '1', 
         role: 'model', 
         text: initialMsg, 
         timestamp: Date.now() 
     }]);
     
     hasInitialized.current = true;
  }, [language, stats.recoveryScore, dailyFocus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isThinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const history = messages.slice(-10);
      const responseText = await chatWithCoach(history, userMsg.text, isDeepThinkEnabled, language);
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText, 
        timestamp: Date.now(),
        isThinking: isDeepThinkEnabled 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        console.error(error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAdaptPlan = () => {
      // Add user confirmation message
      const userMsg: Message = { id: Date.now().toString(), role: 'user', text: "Yes, adapt my plan.", timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      
      // Execute the adaptation in global context
      activateRecoveryMode();
      
      // Simulate immediate AI response
      setTimeout(() => {
          const botMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: language === 'cs' 
                ? "Hotovo. Aktualizoval jsem tvůj trénink na mobilitu a snížil kalorický cíl pro dnešek."
                : "Done. I've updated your training to a mobility flow and adjusted your nutrition targets down for today.", 
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, botMsg]);
      }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 pb-20 relative">
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" 
            alt="Gym Background" 
            className="w-full h-full object-cover opacity-20"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-dark-900/95 via-dark-900/80 to-dark-900"></div>
      </div>

      <header className="flex-none p-4 border-b border-dark-800/50 flex justify-between items-center backdrop-blur-sm relative z-10">
        <div>
            <h1 className="text-lg font-bold text-white">{t('coach.title')}</h1>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-gray-400">{t('common.online')}</span>
            </div>
        </div>
        
        {/* Deep Think Toggle */}
        <button 
            onClick={() => setIsDeepThinkEnabled(!isDeepThinkEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                isDeepThinkEnabled 
                ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                : 'bg-dark-800/80 border-dark-700 text-gray-500 hover:bg-dark-700'
            }`}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-wide">
                {isDeepThinkEnabled ? t('coach.proMode') : t('coach.fastMode')}
            </span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed backdrop-blur-md ${
                msg.role === 'user' 
                ? 'bg-vital-600/90 text-white rounded-br-none shadow-lg shadow-vital-900/20' 
                : 'bg-dark-800/80 text-gray-200 border border-dark-700/50 rounded-bl-none shadow-md'
            }`}>
              {msg.isThinking && (
                  <div className="mb-2 flex items-center gap-1 text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      {t('coach.deepThought')}
                  </div>
              )}
              {msg.text}
            </div>

            {/* Render Action Buttons only for the latest model message if it suggests recovery */}
            {msg.role === 'model' && idx === messages.length - 1 && dailyFocus !== 'Recovery' && stats.recoveryScore < 50 && (
                <div className="mt-2 flex gap-2 animate-fade-in-up">
                    <button 
                        onClick={handleAdaptPlan}
                        className="bg-vital-600/20 hover:bg-vital-600/30 text-vital-400 border border-vital-500/50 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {language === 'cs' ? 'Ano, upravit plán' : 'Yes, adapt plan'}
                    </button>
                    <button 
                        onClick={() => handleSend("No, I want to push through.")}
                        className="bg-dark-800 hover:bg-dark-700 text-gray-400 border border-dark-600 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                        {language === 'cs' ? 'Ne, zvládnu to' : 'No, keep pushing'}
                    </button>
                </div>
            )}
          </div>
        ))}
        {isThinking && (
            <div className="flex justify-start">
                <div className="bg-dark-800/80 p-3 rounded-2xl rounded-bl-none border border-dark-700/50 flex items-center gap-2 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-dark-900/80 backdrop-blur-xl border-t border-dark-800/50 fixed bottom-[72px] left-0 right-0 max-w-md mx-auto z-20">
        <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('coach.placeholder')}
                className="flex-1 bg-dark-800/80 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-vital-500/50 border border-dark-700/50 placeholder-gray-500 text-sm"
            />
            <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isThinking}
                className="w-11 h-11 bg-vital-500 hover:bg-vital-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-dark-900 transition-colors shadow-lg shadow-vital-500/20"
            >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

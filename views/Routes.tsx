import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { findNearbyPlaces } from '../services/geminiService';

export const Routes: React.FC = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, places: { title: string, uri: string }[] } | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleFind = async (queryType: 'run' | 'cycle' | 'gym') => {
    setLoading(true);
    setStatus(t('routes.locating'));
    setResult(null);

    if (!navigator.geolocation) {
        setStatus(t('routes.permissionDenied'));
        setLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        setStatus(t('routes.searching'));
        const { latitude, longitude } = position.coords;
        
        let query = "";
        switch(queryType) {
            case 'run': query = "Find 5km running routes or tracks nearby."; break;
            case 'cycle': query = "Find cycling routes or bike paths nearby."; break;
            case 'gym': query = "Find the best rated gyms nearby."; break;
        }

        try {
            const data = await findNearbyPlaces(query, latitude, longitude, language);
            setResult(data);
        } catch (e) {
            setStatus(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, (error) => {
        setStatus(t('routes.permissionDenied'));
        setLoading(false);
    });
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full flex flex-col">
      <header className="mt-2">
        <h1 className="text-2xl font-bold text-white">{t('routes.title')}</h1>
        <p className="text-sm text-gray-400">{t('routes.subtitle')}</p>
      </header>

      {/* Visual Map Placeholder or Icon */}
      <div className="h-40 bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')] bg-cover bg-center grayscale"></div>
        <div className="relative z-10 p-4 text-center">
            <div className="w-12 h-12 bg-vital-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-vital-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <p className="text-xs text-gray-400">{t('routes.poweredBy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
            onClick={() => handleFind('run')}
            disabled={loading}
            className="flex items-center gap-4 bg-dark-800 p-4 rounded-xl border border-dark-700 hover:border-vital-500/50 transition-all text-left"
        >
            <span className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </span>
            <div className="flex-1">
                <h3 className="font-bold text-white">{t('routes.findRun')}</h3>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <button 
            onClick={() => handleFind('cycle')}
            disabled={loading}
            className="flex items-center gap-4 bg-dark-800 p-4 rounded-xl border border-dark-700 hover:border-vital-500/50 transition-all text-left"
        >
            <span className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <div className="flex-1">
                <h3 className="font-bold text-white">{t('routes.findCycle')}</h3>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <button 
            onClick={() => handleFind('gym')}
            disabled={loading}
            className="flex items-center gap-4 bg-dark-800 p-4 rounded-xl border border-dark-700 hover:border-vital-500/50 transition-all text-left"
        >
            <span className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </span>
            <div className="flex-1">
                <h3 className="font-bold text-white">{t('routes.findGym')}</h3>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {loading && (
          <div className="text-center py-8 text-vital-500 animate-pulse">
              {status}
          </div>
      )}

      {!loading && result && (
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 animate-fade-in-up">
              <div className="prose prose-invert prose-sm mb-4">
                 <p>{result.text}</p>
              </div>
              
              {result.places.length > 0 && (
                  <div className="space-y-2">
                      {result.places.map((place, idx) => (
                          <a 
                            key={idx} 
                            href={place.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block bg-dark-900 hover:bg-dark-700 p-3 rounded-lg flex justify-between items-center transition-colors"
                          >
                              <span className="text-sm font-medium text-white truncate mr-2">{place.title}</span>
                              <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded whitespace-nowrap">{t('routes.openMap')}</span>
                          </a>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
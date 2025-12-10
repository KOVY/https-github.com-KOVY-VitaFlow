
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';
import { connectProvider, disconnectProvider } from '../services/integrationService';
import { IntegrationProvider, View } from '../types';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { integrations, toggleIntegration, syncIntegrations, isSyncing, stats, dailyFocus, isCoachMode, toggleCoachMode, connectWithCoach, userProfile } = useFitness();
  const [connecting, setConnecting] = useState<string | null>(null);
  
  // Coach Connection State
  const [coachCode, setCoachCode] = useState('');
  const [coachError, setCoachError] = useState('');

  const handleToggle = async (provider: IntegrationProvider, currentStatus: boolean) => {
      setConnecting(provider);
      try {
          if (currentStatus) {
              await disconnectProvider(provider);
              toggleIntegration(provider, false);
          } else {
              await connectProvider(provider);
              toggleIntegration(provider, true);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setConnecting(null);
      }
  };

  const handleConnectCoach = () => {
      const success = connectWithCoach(coachCode);
      if (!success) {
          setCoachError(t('settings.invalidCode'));
      } else {
          setCoachError('');
          setCoachCode('');
      }
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in-up">
      <header className="mt-2">
        <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-sm text-gray-400">{t('settings.integrationsDesc')}</p>
      </header>
      
      {/* Coach Mode Switch (Demo Feature) */}
      <div className="bg-gradient-to-r from-blue-900/40 to-dark-800 border border-blue-500/20 rounded-2xl p-4 flex justify-between items-center">
          <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                  {t('settings.coachMode')}
                  <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded uppercase">Pro</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{t('settings.coachModeDesc')}</p>
          </div>
          <button 
            onClick={toggleCoachMode}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${
                isCoachMode 
                ? 'bg-blue-600 text-white shadow-blue-900/40' 
                : 'bg-dark-700 text-gray-300 hover:text-white'
            }`}
          >
              {isCoachMode ? t('settings.switchToClient') : t('settings.switchToCoach')}
          </button>
      </div>
      
      {/* Connect with Coach (User Side) */}
      {!isCoachMode && (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-1">{t('settings.connectCoachTitle')}</h3>
              
              {userProfile.coachId ? (
                   <div className="mt-3 bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                           {userProfile.coachName?.charAt(0)}
                       </div>
                       <div>
                           <p className="text-xs text-green-400 font-bold uppercase">{t('settings.connectedTo')}</p>
                           <p className="text-white font-bold">{userProfile.coachName}</p>
                       </div>
                   </div>
              ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-4">{t('settings.connectCoachDesc')}</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={coachCode}
                            onChange={(e) => setCoachCode(e.target.value.toUpperCase())}
                            placeholder="VITALS"
                            className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-2 text-white font-mono tracking-widest text-center uppercase focus:border-vital-500 outline-none"
                            maxLength={8}
                        />
                        <button 
                            onClick={handleConnectCoach}
                            disabled={!coachCode}
                            className="bg-vital-600 hover:bg-vital-500 text-white px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {t('settings.connectBtn')}
                        </button>
                    </div>
                    {coachError && <p className="text-xs text-red-500 mt-2 ml-1">{coachError}</p>}
                  </>
              )}
          </div>
      )}

      {/* Integrations List */}
      <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase">{t('settings.integrations')}</h2>
          
          {/* Garmin */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-4">
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          G
                      </div>
                      <div>
                          <h3 className="font-bold text-white">Garmin Connect</h3>
                          <p className="text-xs text-gray-400">{t('settings.garminDesc')}</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('garmin', integrations.find(i => i.provider === 'garmin')?.isConnected || false)}
                    disabled={!!connecting}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        integrations.find(i => i.provider === 'garmin')?.isConnected 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-vital-600 text-white'
                    }`}
                  >
                      {connecting === 'garmin' ? '...' : (integrations.find(i => i.provider === 'garmin')?.isConnected ? t('settings.disconnect') : t('settings.connect'))}
                  </button>
              </div>
              {integrations.find(i => i.provider === 'garmin')?.isConnected && (
                  <div className="flex items-center gap-2 text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {t('settings.connected')}
                  </div>
              )}
          </div>

          {/* Oura */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-4">
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-black font-bold">
                          O
                      </div>
                      <div>
                          <h3 className="font-bold text-white">Oura Ring</h3>
                          <p className="text-xs text-gray-400">{t('settings.ouraDesc')}</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('oura', integrations.find(i => i.provider === 'oura')?.isConnected || false)}
                    disabled={!!connecting}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        integrations.find(i => i.provider === 'oura')?.isConnected 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-vital-600 text-white'
                    }`}
                  >
                       {connecting === 'oura' ? '...' : (integrations.find(i => i.provider === 'oura')?.isConnected ? t('settings.disconnect') : t('settings.connect'))}
                  </button>
              </div>
               {integrations.find(i => i.provider === 'oura')?.isConnected && (
                  <div className="flex items-center gap-2 text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {t('settings.connected')}
                  </div>
              )}
          </div>
      </div>

      {/* Sync Action */}
      {integrations.some(i => i.isConnected) && (
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-gray-300">{t('settings.dataPreview')}</h2>
                  <button 
                    onClick={syncIntegrations}
                    disabled={isSyncing}
                    className="flex items-center gap-2 text-vital-500 text-xs font-bold hover:text-vital-400 disabled:opacity-50"
                  >
                      <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      {isSyncing ? t('settings.syncing') : t('settings.syncNow')}
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800 p-3 rounded-xl border border-dark-700 text-center">
                      <span className="block text-2xl font-bold text-white">
                          {stats.hrv ? `${stats.hrv} ms` : '--'}
                      </span>
                      <span className="text-xs text-gray-500 uppercase font-bold">{t('settings.hrv')}</span>
                  </div>
                  <div className="bg-dark-800 p-3 rounded-xl border border-dark-700 text-center">
                      <span className="block text-2xl font-bold text-white">
                          {stats.sleepHours ? `${stats.sleepHours} h` : '--'}
                      </span>
                      <span className="text-xs text-gray-500 uppercase font-bold">{t('settings.sleep')}</span>
                  </div>
              </div>

              <div className="mt-3 text-right">
                  <p className="text-[10px] text-gray-600">
                      {t('settings.lastSync')} {integrations.find(i => i.isConnected)?.lastSync || '--'}
                  </p>
              </div>
          </div>
      )}

      {/* Auto-Adaptation Notification Banner */}
      {dailyFocus === 'Recovery' && stats.sleepHours !== undefined && (
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                  <h3 className="text-sm font-bold text-blue-400">{t('settings.autoAdaptTitle')}</h3>
                  <p className="text-xs text-gray-300 mt-1">{t('settings.autoAdaptDesc')}</p>
              </div>
          </div>
      )}
    </div>
  );
};

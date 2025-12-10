
import React from 'react';
import { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';

interface CoachDashboardProps {
  onNavigate: (view: View) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { clients } = useFitness();

  const getComplianceColor = (score: number) => {
      if (score >= 90) return 'text-vital-500';
      if (score >= 70) return 'text-yellow-500';
      return 'text-red-500';
  };

  const getStatusDot = (status: 'online' | 'offline') => {
      return status === 'online' ? 'bg-green-500' : 'bg-gray-600';
  };

  return (
    <div className="p-4 space-y-6 pb-24 animate-fade-in">
      <header className="mt-2 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white">{t('coachDash.title')}</h1>
            <p className="text-sm text-gray-400">Monday, Oct 24</p>
        </div>
        <button className="bg-vital-600 hover:bg-vital-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-vital-900/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-800 p-4 rounded-2xl border border-dark-700">
              <span className="text-2xl font-bold text-white">{clients.length}</span>
              <p className="text-xs text-gray-400 font-bold uppercase mt-1">{t('coachDash.activeClients')}</p>
          </div>
          <div className="bg-dark-800 p-4 rounded-2xl border border-dark-700 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-2 -mt-2"></div>
              <span className="text-2xl font-bold text-white relative z-10">
                  {clients.reduce((acc, c) => acc + c.alerts, 0)}
              </span>
              <p className="text-xs text-red-400 font-bold uppercase mt-1 relative z-10">{t('coachDash.pendingAlerts')}</p>
          </div>
      </div>

      {/* Action Bar */}
      <button 
         onClick={() => onNavigate(View.PLAN_EDITOR)}
         className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/50 text-blue-400 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
      >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {t('coachDash.createPlan')}
      </button>

      {/* Client List */}
      <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 px-1">{t('coachDash.clientList')}</h2>
          <div className="space-y-3">
              {clients.map(client => (
                  <div key={client.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 active:scale-[0.99] transition-all cursor-pointer hover:border-vital-500/30">
                      <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                              <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold border border-gray-500">
                                      {client.name.charAt(0)}
                                  </div>
                                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-800 ${getStatusDot(client.status)}`}></div>
                              </div>
                              <div>
                                  <h3 className="font-bold text-white text-sm">{client.name}</h3>
                                  <p className="text-xs text-gray-400 flex items-center gap-1">
                                    {client.planName}
                                    {client.planId && <span className="text-blue-500">•</span>}
                                  </p>
                              </div>
                          </div>
                          <div className="flex flex-col items-end">
                                <span className={`text-sm font-bold ${getComplianceColor(client.complianceScore)}`}>
                                    {client.complianceScore}%
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase">{t('coachDash.compliance')}</span>
                          </div>
                      </div>

                      {/* Mini Stats Row */}
                      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-dark-700/50">
                            <div className="text-center">
                                <span className="block text-xs font-bold text-gray-300">{client.stats.recoveryScore}%</span>
                                <span className="text-[9px] text-gray-500 uppercase">Rec</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs font-bold text-gray-300">{client.stats.caloriesConsumed}</span>
                                <span className="text-[9px] text-gray-500 uppercase">Kcal</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs font-bold text-gray-300">{client.stats.proteinConsumed}g</span>
                                <span className="text-[9px] text-gray-500 uppercase">Prot</span>
                            </div>
                            <div className="text-center flex justify-center items-center">
                                {client.alerts > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {client.alerts} Alerts
                                    </span>
                                ) : (
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness } from '../contexts/FitnessContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { t, language, setLanguage } = useLanguage();
  const { isCoachMode } = useFitness();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If we are in AUTH view, render clean layout without nav
  if (currentView === View.AUTH) {
      return (
          <div className="min-h-screen bg-dark-900 text-gray-100 font-sans">
              {children}
              <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
                    className="bg-dark-800 border border-dark-700 rounded-full px-3 py-1 text-xs font-bold text-vital-500 hover:bg-dark-700 transition-colors"
                >
                    {language.toUpperCase()}
                </button>
             </div>
          </div>
      );
  }

  // Client Nav Items
  const clientNavItems = [
    { id: View.DASHBOARD, label: t('nav.dashboard'), icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { id: View.TRAINING, label: t('nav.training'), icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    )},
    { id: View.NUTRITION, label: t('nav.nutrition'), icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    )},
    { id: View.COACH, label: t('nav.coach'), icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    )},
  ];

  // Coach Nav Items
  const coachNavItems = [
      { id: View.COACH_DASHBOARD, label: t('nav.coachDash'), icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      )},
      { id: View.COACH_CLIENTS, label: t('nav.clients'), icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )},
      { id: View.PLANS, label: t('nav.library'), icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      )},
      { id: View.COACH, label: t('nav.inbox'), icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      )},
  ];

  const bottomNavItems = isCoachMode ? coachNavItems : clientNavItems;

  // Sidebar Items (Secondary)
  const sidebarItems = isCoachMode ? [
      { id: View.SETTINGS, label: t('nav.settings'), icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )}
  ] : [
      { id: View.STUDIO, label: t('nav.studio'), icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      )},
      { id: View.ROUTES, label: t('nav.routes'), icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
      )},
      { id: View.PLANS, label: t('nav.plans'), icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      )},
      { id: View.SETTINGS, label: t('nav.settings'), icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )}
  ];

  const handleNavClick = (id: View) => {
      onNavigate(id);
      setIsSidebarOpen(false);
  };

  const handleLogout = () => {
      onNavigate(View.AUTH);
      setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Top Header */}
      <header className={`flex-none h-14 bg-dark-900/90 backdrop-blur border-b border-dark-800 flex items-center justify-between px-4 z-40 relative ${isCoachMode ? 'border-b-vital-500/20' : ''}`}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 -ml-2 flex items-center justify-center text-gray-300 hover:text-white"
          >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>

          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCoachMode ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-vital-500'}`}></span>
            VitalFlow {isCoachMode && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 ml-1">COACH</span>}
          </span>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600"></div>
      </header>

      {/* Sidebar (Hamburger Menu) */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-dark-900 border-r border-dark-700 shadow-2xl flex flex-col">
              <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                  <h2 className="font-bold text-xl text-white">{t('nav.menu')}</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>

              <div className="flex-1 p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Apps</p>
                  {sidebarItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            currentView === item.id ? 'bg-vital-500/10 text-vital-500' : 'hover:bg-dark-800 text-gray-300'
                        }`}
                      >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                      </button>
                  ))}
                  
                  <div className="border-t border-dark-800 my-4"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Preferences</p>
                  
                  <button 
                     onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-800 text-gray-300 transition-colors"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                      <span className="font-medium">{language === 'en' ? 'Čeština' : 'English'}</span>
                  </button>

                  <button 
                     onClick={handleLogout}
                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors mt-auto"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span className="font-medium">{t('nav.logout')}</span>
                  </button>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        {children}
      </main>

      {/* Bottom Navigation (Floating Style) */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-dark-900 to-transparent pt-8">
        <div className="bg-dark-800/90 backdrop-blur-md border border-dark-700/50 rounded-2xl shadow-2xl flex justify-between items-center px-2 py-2 max-w-md mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = currentView === item.id;
            const activeColorClass = isCoachMode ? 'text-blue-500' : 'text-vital-500';
            const activeBgClass = isCoachMode ? 'bg-blue-500/10' : 'bg-vital-500/10';

            return (
                <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex-1 flex flex-col items-center justify-center h-14 relative transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                >
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isActive ? `${activeBgClass} scale-90` : 'scale-0 group-hover:scale-90 group-hover:bg-dark-700/50'}`}></div>
                    <div className={`relative transition-transform duration-300 group-active:scale-90 ${isActive ? '-translate-y-1' : ''}`}>
                        {item.icon}
                    </div>
                    <span className={`text-[10px] font-bold absolute bottom-2 transition-all duration-300 ${
                        isActive ? `opacity-100 translate-y-0 ${activeColorClass}` : 'opacity-0 translate-y-2'
                    }`}>
                        {item.label}
                    </span>
                </button>
            )
          })}
        </div>
      </nav>
    </div>
  );
};

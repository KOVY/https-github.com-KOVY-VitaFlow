
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Training } from './views/Training';
import { Nutrition } from './views/Nutrition';
import { Coach } from './views/Coach';
import { Studio } from './views/Studio';
import { Routes } from './views/Routes';
import { Auth } from './views/Auth';
import { Plans } from './views/Plans';
import { PlanEditor } from './views/PlanEditor';
import { Settings } from './views/Settings';
import { CoachDashboard } from './views/CoachDashboard';
import { View } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { FitnessProvider, useFitness } from './contexts/FitnessContext';

const AppContent: React.FC = () => {
  // Start with AUTH view to simulate login flow
  const [currentView, setCurrentView] = useState<View>(View.AUTH);
  const { isCoachMode } = useFitness();

  // Redirect to appropriate dashboard when mode changes
  useEffect(() => {
      if (currentView !== View.AUTH) {
          if (isCoachMode && currentView === View.DASHBOARD) {
              setCurrentView(View.COACH_DASHBOARD);
          } else if (!isCoachMode && currentView === View.COACH_DASHBOARD) {
              setCurrentView(View.DASHBOARD);
          }
      }
  }, [isCoachMode]);

  const renderView = () => {
    switch (currentView) {
      case View.AUTH:
        return <Auth onNavigate={setCurrentView} />;
      case View.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case View.TRAINING:
        return <Training />;
      case View.NUTRITION:
        return <Nutrition />;
      case View.COACH:
        return <Coach />;
      case View.STUDIO:
        return <Studio />;
      case View.ROUTES:
        return <Routes />;
      case View.PLANS:
        return <Plans onNavigate={setCurrentView} />;
      case View.PLAN_EDITOR:
        return <PlanEditor onNavigate={setCurrentView} />;
      case View.SETTINGS:
        return <Settings />;
      // Coach Views
      case View.COACH_DASHBOARD:
        return <CoachDashboard onNavigate={setCurrentView} />;
      case View.COACH_CLIENTS:
        return <CoachDashboard onNavigate={setCurrentView} />; // Reuse dash for client list in MVP
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <FitnessProvider>
        <AppContent />
      </FitnessProvider>
    </LanguageProvider>
  );
}

export default App;

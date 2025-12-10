
import React, { createContext, useContext, useState } from 'react';
import { DailyStats, Exercise, IntegrationStatus, IntegrationProvider, NutritionLog, Client, Plan, UserProfile } from '../types';
import { fetchIntegrationData } from '../services/integrationService';

export interface HistoryEntry {
  date: string;
  weight: number;
  reps: number;
  rpe: number;
}

interface FitnessContextType {
  stats: DailyStats;
  updateStats: (newStats: Partial<DailyStats>) => void;
  userProfile: UserProfile;
  updateUserProfile: (newProfile: Partial<UserProfile>) => void;
  connectWithCoach: (code: string) => boolean;
  
  // Training State
  trainingPlanName: string;
  dailyFocus: string; // e.g. "Hypertrophy", "Recovery", "Strength"
  exercises: Exercise[];
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  getExerciseHistory: (exerciseId: string) => HistoryEntry[];
  
  // Plan Management
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  assignPlanToClient: (planId: string, clientId: string) => void;
  
  // Nutrition State
  nutritionLogs: NutritionLog[];
  addNutritionLog: (log: NutritionLog) => void;

  // AI Actions
  activateRecoveryMode: () => void;
  
  // Integrations
  integrations: IntegrationStatus[];
  toggleIntegration: (provider: IntegrationProvider, isConnected: boolean) => void;
  syncIntegrations: () => Promise<void>;
  isSyncing: boolean;

  // Coach Mode
  isCoachMode: boolean;
  toggleCoachMode: () => void;
  clients: Client[];
}

const FitnessContext = createContext<FitnessContextType | null>(null);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial state simulating the user's current situation (Low Sleep, Heavy Load)
  const [stats, setStats] = useState<DailyStats>({
    caloriesConsumed: 1850,
    caloriesTarget: 3150, // Initial high target for Leg Day
    proteinConsumed: 140,
    proteinTarget: 210,
    carbsConsumed: 120, 
    carbsTarget: 300,
    fatsConsumed: 45, 
    fatsTarget: 70,   
    recoveryScore: 42,     // Low score due to lack of sleep
    sleepHours: undefined  // Undefined to simulate missing external data
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 30,
    sex: 'male',
    weight: 85,
    goal: 'hypertrophy'
  });

  // Nutrition Logs State
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([
      { id: '1', foodName: 'Oatmeal & Berries', calories: 450, protein: 15, carbs: 60, fats: 8, timestamp: Date.now() - 14400000 },
  ]);

  const addNutritionLog = (log: NutritionLog) => {
      setNutritionLogs(prev => [log, ...prev]);
      setStats(prev => ({
          ...prev,
          caloriesConsumed: prev.caloriesConsumed + log.calories,
          proteinConsumed: prev.proteinConsumed + log.protein,
          carbsConsumed: prev.carbsConsumed + log.carbs,
          fatsConsumed: prev.fatsConsumed + log.fats,
      }));
  };

  // Integrations State
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
      { provider: 'garmin', isConnected: false },
      { provider: 'oura', isConnected: false }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Global Training State - Expanded to "Pro" Push Day
  const [trainingPlanName, setTrainingPlanName] = useState("Push Hypertrophy");
  const [dailyFocus, setDailyFocus] = useState("High Volume");
  const [exercises, setExercises] = useState<Exercise[]>([
      { id: '1', name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', weight: '34kg', completed: false },
      { id: '2', name: 'Machine Shoulder Press', sets: 3, reps: '10-12', weight: '60kg', completed: false },
      { id: '3', name: 'Cable Chest Flys', sets: 3, reps: '12-15', weight: '25kg', completed: false },
      { id: '4', name: 'Lateral Raises', sets: 4, reps: '12-15', weight: '14kg', completed: false },
      { id: '5', name: 'Weighted Dips', sets: 3, reps: '8-10', weight: '+15kg', completed: false },
      { id: '6', name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15', weight: '30kg', completed: false },
  ]);

  // Plan Management State
  const [plans, setPlans] = useState<Plan[]>([
      { 
          id: '1', name: 'Hypertrophy Push/Pull', description: 'Classic bodybuilding split', durationWeeks: 8, workoutsPerWeek: 4, focus: 'hypertrophy', isActive: true, authorId: 'user', exercises: [], createdAt: new Date().toISOString() 
      },
      { 
          id: '2', name: 'Strength 5x5', description: 'Powerlifting foundation', durationWeeks: 12, workoutsPerWeek: 3, focus: 'strength', isActive: false, authorId: 'user', exercises: [], createdAt: new Date().toISOString() 
      },
  ]);

  const addPlan = (plan: Plan) => {
      setPlans(prev => [plan, ...prev]);
  };

  const assignPlanToClient = (planId: string, clientId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Update Client
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, planId: planId, planName: plan.name } : c));
      
      // Update Plan (optional, if we want bidirectional link)
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, assignedToClientId: clientId } : p));
  };

  // COACH MODE STATE
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [clients, setClients] = useState<Client[]>([
      {
          id: '1',
          name: 'Sarah Connor',
          planName: 'Glute Focus 2.0',
          complianceScore: 92,
          lastActive: new Date().toISOString(),
          status: 'online',
          alerts: 1,
          stats: { caloriesConsumed: 1200, caloriesTarget: 2200, proteinConsumed: 90, proteinTarget: 150, carbsConsumed: 100, carbsTarget: 250, fatsConsumed: 40, fatsTarget: 60, recoveryScore: 85, sleepHours: 7.5 }
      },
      {
          id: '2',
          name: 'Marcus Fenix',
          planName: 'Strength 5x5',
          complianceScore: 68,
          lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          status: 'offline',
          alerts: 2,
          stats: { caloriesConsumed: 2800, caloriesTarget: 3500, proteinConsumed: 180, proteinTarget: 220, carbsConsumed: 300, carbsTarget: 400, fatsConsumed: 80, fatsTarget: 100, recoveryScore: 45, sleepHours: 5.5 }
      },
      {
          id: '3',
          name: 'Ellen Ripley',
          planName: 'Endurance Prep',
          complianceScore: 98,
          lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'offline',
          alerts: 0,
          stats: { caloriesConsumed: 1800, caloriesTarget: 2400, proteinConsumed: 120, proteinTarget: 140, carbsConsumed: 200, carbsTarget: 300, fatsConsumed: 50, fatsTarget: 70, recoveryScore: 92, sleepHours: 8.2 }
      }
  ]);

  const toggleCoachMode = () => setIsCoachMode(!isCoachMode);

  const connectWithCoach = (code: string): boolean => {
      if (code.toUpperCase() === 'VITALS') {
          setUserProfile(prev => ({ ...prev, coachId: 'coach-1', coachName: 'Dr. Vital' }));
          return true;
      }
      return false;
  };

  const updateStats = (newStats: Partial<DailyStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const updateUserProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...newProfile }));
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const getExerciseHistory = (exerciseId: string): HistoryEntry[] => {
      // Mock Data Generation
      const now = Date.now();
      const day = 86400000;
      // Deterministic pseudo-random generation based on ID char codes
      const seed = exerciseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const baseWeight = (seed % 60) + 20; // 20-80kg base
      
      return [
          { date: new Date(now - day * 25).toLocaleDateString(), weight: baseWeight, reps: 10, rpe: 7 },
          { date: new Date(now - day * 18).toLocaleDateString(), weight: baseWeight + 2.5, reps: 10, rpe: 8 },
          { date: new Date(now - day * 11).toLocaleDateString(), weight: baseWeight + 5, reps: 9, rpe: 8.5 },
          { date: new Date(now - day * 4).toLocaleDateString(), weight: baseWeight + 5, reps: 10, rpe: 9 },
      ].reverse();
  };

  // The AI "Action" that ripples through the app
  const activateRecoveryMode = () => {
    // 1. Change Training
    setTrainingPlanName("Active Recovery Flow");
    setDailyFocus("Recovery");
    setExercises([
        { id: 'r1', name: 'Foam Rolling (Quads/Back)', sets: 1, reps: '5 min', weight: 'BW', completed: false },
        { id: 'r2', name: '90/90 Hip Stretch', sets: 3, reps: '60s', weight: 'BW', completed: false },
        { id: 'r3', name: 'Thoracic Mobility', sets: 3, reps: '10 reps', weight: 'BW', completed: false },
    ]);

    // 2. Adapt Nutrition (Lower Calories, Maintenance Protein)
    setStats(prev => ({
        ...prev,
        caloriesTarget: 2400, // Reduced from 3150
        proteinTarget: 160    // Reduced from 210
    }));
  };

  // Manage Integration Connections
  const toggleIntegration = (provider: IntegrationProvider, isConnected: boolean) => {
      setIntegrations(prev => prev.map(i => i.provider === provider ? { ...i, isConnected } : i));
  };

  // Sync Data Logic
  const syncIntegrations = async () => {
      const activeProvider = integrations.find(i => i.isConnected);
      if (!activeProvider) return;

      setIsSyncing(true);
      try {
          const data = await fetchIntegrationData(activeProvider.provider);
          
          // Update Stats with fetched data
          setStats(prev => ({
              ...prev,
              sleepHours: data.sleepHours,
              hrv: data.hrv,
              // Simple algorithm to calculate recovery score based on HRV and Sleep
              recoveryScore: Math.min(100, Math.round((data.hrv * 1.2) + (data.sleepHours * 5)))
          }));
          
          // Update Last Sync
          setIntegrations(prev => prev.map(i => i.provider === activeProvider.provider ? { ...i, lastSync: new Date().toLocaleTimeString() } : i));

          // Trigger Auto-Adaptation if data is poor (Simulated for Oura in this demo)
          if (data.hrv < 35 || data.sleepHours < 6) {
              activateRecoveryMode();
          } else {
              // Reset if good (optional, but good for demo toggling)
              if (trainingPlanName === "Active Recovery Flow") {
                   setTrainingPlanName("Push Hypertrophy");
                   setDailyFocus("High Volume");
                   setExercises([
                        { id: '1', name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', weight: '34kg', completed: false },
                        { id: '2', name: 'Machine Shoulder Press', sets: 3, reps: '10-12', weight: '60kg', completed: false },
                        { id: '3', name: 'Cable Chest Flys', sets: 3, reps: '12-15', weight: '25kg', completed: false },
                        { id: '4', name: 'Lateral Raises', sets: 4, reps: '12-15', weight: '14kg', completed: false },
                        { id: '5', name: 'Weighted Dips', sets: 3, reps: '8-10', weight: '+15kg', completed: false },
                        { id: '6', name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15', weight: '30kg', completed: false },
                    ]);
              }
          }

      } catch (error) {
          console.error("Sync failed", error);
      } finally {
          setIsSyncing(false);
      }
  };

  return (
    <FitnessContext.Provider value={{ 
        stats, updateStats, 
        userProfile, updateUserProfile, connectWithCoach,
        trainingPlanName, dailyFocus, exercises, updateExercise,
        getExerciseHistory,
        plans, addPlan, assignPlanToClient,
        nutritionLogs, addNutritionLog,
        activateRecoveryMode,
        integrations, toggleIntegration, syncIntegrations, isSyncing,
        isCoachMode, toggleCoachMode, clients
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};

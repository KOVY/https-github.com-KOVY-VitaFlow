
export enum View {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  TRAINING = 'TRAINING',
  NUTRITION = 'NUTRITION',
  COACH = 'COACH',
  STUDIO = 'STUDIO',
  ROUTES = 'ROUTES',
  PLANS = 'PLANS',
  PLAN_EDITOR = 'PLAN_EDITOR',
  SETTINGS = 'SETTINGS',
  // Coach Specific Views
  COACH_DASHBOARD = 'COACH_DASHBOARD',
  COACH_CLIENTS = 'COACH_CLIENTS',
  COACH_CLIENT_DETAIL = 'COACH_CLIENT_DETAIL'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  timestamp: number;
}

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MoodLog {
  stress: number;
  happiness: number;
  note: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface DailyStats {
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatsConsumed: number;
  fatsTarget: number;
  recoveryScore: number;
  sleepHours?: number;
  hrv?: number;
}

export interface NutritionLog {
    id: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    timestamp: number;
    image?: string;
}

export interface NutritionPlan {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  reasoning: string;
  mealTiming: {
    time: string;
    label: string;
    suggestion: string;
  }[];
  supplements: {
    name: string;
    dosage: string;
    reason: string;
  }[];
}

export interface GroceryItem {
  category: string;
  item: string;
  quantity: string;
  checked: boolean;
}

export interface FormAnalysis {
  exerciseName: string;
  safetyScore: number; // 0-100
  goodPoints: string[];
  improvements: string[];
  verdict: string;
}

export type IntegrationProvider = 'garmin' | 'oura' | 'apple_health';

export interface IntegrationStatus {
    provider: IntegrationProvider;
    isConnected: boolean;
    lastSync?: string;
}

// Plan Types
export interface PlanExercise {
    id: string; 
    exerciseId: string;
    name: string;
    sets: number;
    reps: string;
    weight: number;
    rest: number;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    durationWeeks: number;
    workoutsPerWeek: number;
    focus: string;
    exercises: PlanExercise[];
    isActive: boolean;
    assignedToClientId?: string; // If null, it's a template or personal plan
    authorId: string; // 'user' or coach ID
    createdAt: string;
}

// Coach Types
export interface Client {
    id: string;
    name: string;
    avatarUrl?: string;
    planId?: string; // Link to the specific plan
    planName: string;
    complianceScore: number; // 0-100
    lastActive: string; // ISO string
    status: 'online' | 'offline';
    alerts: number; // number of unread logs/issues
    stats: DailyStats; // Snapshot of their current day
}

export interface UserProfile {
  age: number;
  sex: 'male' | 'female';
  weight: number;
  goal: string;
  coachId?: string; // If the user has a coach
  coachName?: string;
}

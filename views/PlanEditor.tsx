
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFitness, HistoryEntry } from '../contexts/FitnessContext';
import { View, Plan } from '../types';

interface PlanEditorProps {
  onNavigate: (view: View) => void;
}

interface PlanExercise {
    id: string; // unique instance id
    exerciseId: string;
    name: string;
    targetSets: number | string;
    targetReps: string;
    targetWeight: number | string;
    targetRest: number | string;
}

// Keys for translation lookup and metadata
const EXERCISE_KEYS = [
    { id: 'bench', cat: 'chest', equip: 'barbell' },
    { id: 'squat', cat: 'legs', equip: 'barbell' },
    { id: 'deadlift', cat: 'back', equip: 'barbell' },
    { id: 'ohp', cat: 'shoulders', equip: 'barbell' },
    { id: 'pullup', cat: 'back', equip: 'bodyweight' },
    { id: 'row', cat: 'back', equip: 'barbell' },
    { id: 'lunges', cat: 'legs', equip: 'bodyweight' },
    { id: 'curls', cat: 'arms', equip: 'dumbbell' },
    { id: 'ext', cat: 'arms', equip: 'cable' },
    { id: 'legpress', cat: 'legs', equip: 'machine' },
    { id: 'latraise', cat: 'shoulders', equip: 'dumbbell' },
];

/**
 * Calculates Levenshtein distance between two strings
 */
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length; 
  if (b.length === 0) return a.length; 

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

interface ExerciseCardProps {
    ex: PlanExercise;
    index: number;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragEnter: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: keyof PlanExercise, value: any) => void;
    onViewHistory: (exerciseId: string, exerciseName: string) => void;
    libraryExercises: any[]; 
    t: (key: string) => string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
    ex, index, isDragging, onDragStart, onDragEnter, onDragEnd, onRemove, onUpdate, onViewHistory, libraryExercises, t 
}) => {
    const [isHandleHovered, setIsHandleHovered] = useState(false);
    
    // Dynamic lookup for localized name
    const libraryEx = libraryExercises.find(le => le.id === ex.exerciseId);
    const displayName = libraryEx ? libraryEx.name : ex.name;

    const inputClasses = "w-full bg-dark-900 border border-dark-700 rounded-lg px-2 py-2 text-sm text-center text-white font-medium focus:border-vital-500 focus:ring-1 focus:ring-vital-500/50 outline-none transition-all duration-200 hover:border-dark-600 shadow-sm";

    return (
        <div 
            draggable={isHandleHovered}
            onDragStart={(e) => onDragStart(e, index)}
            onDragEnter={(e) => onDragEnter(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            className={`bg-dark-800 border border-dark-700 rounded-xl p-4 relative group transition-all duration-200 shadow-md ${
                isDragging ? 'opacity-40 border-dashed border-vital-500 bg-dark-800/50 scale-[0.98]' : 'opacity-100 hover:border-dark-600'
            }`}
        >
             <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                     {/* Drag Handle */}
                     <div 
                        className={`cursor-grab p-1.5 rounded-lg transition-colors ${isHandleHovered ? 'bg-dark-700 text-white' : 'text-dark-600 hover:text-gray-400'}`}
                        onMouseEnter={() => setIsHandleHovered(true)}
                        onMouseLeave={() => setIsHandleHovered(false)}
                        onTouchStart={() => setIsHandleHovered(true)} // Basic mobile touch support
                     >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                     </div>
                     <h4 className="font-bold text-white text-sm sm:text-base">{displayName}</h4>
                 </div>
                 
                 <div className="flex items-center gap-1">
                    {/* View History Button */}
                    <button 
                        onClick={() => onViewHistory(ex.exerciseId, displayName)}
                        className="text-gray-500 hover:text-vital-400 transition-colors p-1.5 rounded-lg hover:bg-vital-500/10"
                        title={t('planEditor.viewHistory')}
                    >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                    </button>
                    {/* Remove Button */}
                    <button 
                        onClick={() => onRemove(ex.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                    >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
             </div>
             
             <div className="grid grid-cols-4 gap-3">
                 <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5 tracking-wider">{t('planEditor.sets')}</label>
                     <input 
                        type="number"
                        min="1"
                        value={ex.targetSets}
                        onChange={(e) => onUpdate(ex.id, 'targetSets', e.target.value)}
                        className={inputClasses}
                        placeholder="3"
                     />
                 </div>
                 <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5 tracking-wider">{t('planEditor.reps')}</label>
                     <input 
                        type="text" 
                        value={ex.targetReps}
                        onChange={(e) => onUpdate(ex.id, 'targetReps', e.target.value)}
                        className={inputClasses}
                        placeholder="8-12"
                     />
                 </div>
                 <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5 tracking-wider">{t('planEditor.weight')}</label>
                     <input 
                        type="number" 
                        min="0"
                        step="0.5"
                        value={ex.targetWeight}
                        onChange={(e) => onUpdate(ex.id, 'targetWeight', e.target.value)}
                        className={inputClasses}
                        placeholder="10"
                     />
                 </div>
                 <div>
                     <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1.5 tracking-wider">{t('planEditor.rest')}</label>
                     <input 
                        type="number"
                        min="0"
                        step="5"
                        value={ex.targetRest}
                        onChange={(e) => onUpdate(ex.id, 'targetRest', e.target.value)}
                        className={inputClasses}
                        placeholder="90"
                     />
                 </div>
             </div>
        </div>
    );
};

export const PlanEditor: React.FC<PlanEditorProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { getExerciseHistory, addPlan, isCoachMode, clients, assignPlanToClient } = useFitness();
  
  // Plan Details State
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [focus, setFocus] = useState('hypertrophy');
  const [duration, setDuration] = useState(8);
  const [freq, setFreq] = useState(4);
  const [exercises, setExercises] = useState<PlanExercise[]>([]);
  
  // UI State
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{name: string, data: HistoryEntry[]} | null>(null);
  
  // Assignment Modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignTo, setAssignTo] = useState<string>('self'); // 'self' or clientId

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Filter States
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterEquipment, setFilterEquipment] = useState<string | null>(null);

  // Dynamically build the library list based on current language
  const libraryExercises = useMemo(() => {
    return EXERCISE_KEYS.map(key => ({
        id: key.id,
        name: t(`exercises.${key.id}`),
        category: t(`categories.${key.cat}`),
        categoryKey: key.cat,
        equipment: t(`equipment.${key.equip}`),
        equipmentKey: key.equip
    }));
  }, [t]);

  // Unique lists for filter chips - mapped to objects {key, label}
  const categoryOptions = useMemo(() => {
    const keys = Array.from(new Set(libraryExercises.map(e => e.categoryKey)));
    return keys.map(key => ({
        key,
        label: libraryExercises.find(e => e.categoryKey === key)?.category || key
    }));
  }, [libraryExercises]);

  const equipmentOptions = useMemo(() => {
    const keys = Array.from(new Set(libraryExercises.map(e => e.equipmentKey)));
    return keys.map(key => ({
        key,
        label: libraryExercises.find(e => e.equipmentKey === key)?.equipment || key
    }));
  }, [libraryExercises]);

  const focusOptions = [
    { id: 'strength', label: t('planEditor.focusStrength'), icon: '💪' },
    { id: 'hypertrophy', label: t('planEditor.focusHypertrophy'), icon: '🦍' },
    { id: 'endurance', label: t('planEditor.focusEndurance'), icon: '🏃' },
    { id: 'hybrid', label: t('planEditor.focusHybrid'), icon: '⚡' },
  ];

  const handleAddExercise = (ex: typeof libraryExercises[0]) => {
      // Standard Defaults
      const defaultSets = 3;
      const defaultReps = '8-12';
      const defaultRest = 90;
      
      // Weight logic: 0kg for bodyweight, 10kg for others
      const defaultWeight = ex.equipmentKey === 'bodyweight' ? 0 : 10;

      const newExercise: PlanExercise = {
          id: Date.now().toString(),
          exerciseId: ex.id,
          name: ex.name,
          targetSets: defaultSets,
          targetReps: defaultReps,
          targetWeight: defaultWeight,
          targetRest: defaultRest
      };
      setExercises([...exercises, newExercise]);
      setIsAdding(false);
      setSearch('');
      setFilterCategory(null);
      setFilterEquipment(null);
  };

  const handleRemoveExercise = (id: string) => {
      setExercises(exercises.filter(e => e.id !== id));
  };

  const updateExercise = (id: string, field: keyof PlanExercise, value: any) => {
      setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleViewHistory = (exerciseId: string, exerciseName: string) => {
      const history = getExerciseHistory(exerciseId);
      setSelectedHistory({ name: exerciseName, data: history });
      setHistoryModalOpen(true);
  };
  
  const handlePreSave = () => {
      setAssignmentModalOpen(true);
  };

  const handleFinalSave = () => {
      const planId = Date.now().toString();
      const planData: Plan = {
          id: planId,
          name: planName || "Untitled Plan",
          description: description,
          durationWeeks: duration,
          workoutsPerWeek: freq,
          focus: focus,
          isActive: assignTo === 'self', // If personal, active. If client, waiting.
          authorId: isCoachMode ? 'coach-1' : 'user',
          assignedToClientId: assignTo === 'self' ? undefined : assignTo,
          createdAt: new Date().toISOString(),
          exercises: exercises.map(ex => ({
              id: ex.id,
              exerciseId: ex.exerciseId,
              name: ex.name,
              sets: Number(ex.targetSets) || 0,
              reps: ex.targetReps,
              weight: Number(ex.targetWeight) || 0,
              rest: Number(ex.targetRest) || 0
          })),
      };
      
      addPlan(planData);
      
      if (assignTo !== 'self') {
          assignPlanToClient(planId, assignTo);
      }
      
      onNavigate(isCoachMode ? View.COACH_DASHBOARD : View.PLANS);
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString()); // For Firefox
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (draggedIndex === null) return;
    if (draggedIndex === index) return;

    // Swap items in the list
    const newExercises = [...exercises];
    const draggedItem = newExercises[draggedIndex];
    newExercises.splice(draggedIndex, 1);
    newExercises.splice(index, 0, draggedItem);
    
    setExercises(newExercises);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Fuzzy Search & Filtering Logic
  const filteredExercises = useMemo(() => {
    let result = libraryExercises;

    // 1. Strict Filters (using keys for robustness)
    if (filterCategory) {
        result = result.filter(e => e.categoryKey === filterCategory);
    }
    if (filterEquipment) {
        result = result.filter(e => e.equipmentKey === filterEquipment);
    }

    // 2. Fuzzy Search
    if (search.trim()) {
        const lowerSearch = search.toLowerCase().trim();
        const searchTokens = lowerSearch.split(/\s+/).filter(t => t.length > 0);
        
        result = result.map(ex => {
            const lowerName = ex.name.toLowerCase();
            const lowerId = ex.id.toLowerCase();
            const nameTokens = lowerName.split(/\s+/);
            
            let totalScore = 0;
            let matchedTokensCount = 0;
            
            for (const searchToken of searchTokens) {
                let maxTokenScore = 0;
                
                // Boost for ID matches (e.g. searching "bench" when name is "Benčpres")
                if (lowerId.includes(searchToken)) {
                    maxTokenScore = 100;
                }

                for (const nameToken of nameTokens) {
                    let currentScore = 0;
                    if (nameToken === searchToken) currentScore = 100;
                    else if (nameToken.startsWith(searchToken)) currentScore = 90;
                    else if (nameToken.includes(searchToken)) currentScore = 75; // Increased partial match
                    else {
                        const dist = levenshteinDistance(nameToken, searchToken);
                        const len = Math.max(nameToken.length, searchToken.length);
                        
                        // Relaxed forgiving logic
                        let allowedEdits = 0;
                        if (len >= 3) allowedEdits = 1; // Allow 1 edit for 3+ chars
                        if (len >= 6) allowedEdits = 2; // Allow 2 edits for 6+ chars
                        if (len >= 9) allowedEdits = 3; // Allow 3 edits for long words

                        if (dist <= allowedEdits) {
                             currentScore = 70 - (dist * 10); 
                        }
                    }
                    if (currentScore > maxTokenScore) maxTokenScore = currentScore;
                }
                if (maxTokenScore > 0) {
                    totalScore += maxTokenScore;
                    matchedTokensCount++;
                }
            }

            if (lowerName.includes(lowerSearch)) totalScore += 20;

            const relevance = matchedTokensCount === searchTokens.length 
                ? totalScore 
                : (totalScore / searchTokens.length) * matchedTokensCount * 0.5;

            return { ...ex, score: relevance };
        })
        .filter(ex => ex.score > 25)
        .sort((a, b) => b.score - a.score);
    }

    return result;
  }, [libraryExercises, search, filterCategory, filterEquipment]);

  const hasActiveFilters = filterCategory !== null || filterEquipment !== null;

  return (
    <div className="p-4 space-y-6 pb-24 h-full flex flex-col animate-fade-in-up relative">
      
      {/* Assignment Modal Overlay */}
      {assignmentModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm" onClick={() => setAssignmentModalOpen(false)}></div>
              <div className="bg-dark-800 border border-dark-700 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl animate-fade-in-up">
                  <div className="mb-4">
                      <div className="w-12 h-12 bg-vital-600 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-vital-900/50 text-white">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">{t('planEditor.assignTitle')}</h3>
                      <p className="text-gray-400 text-sm mt-1">{t('planEditor.assignDesc')}</p>
                  </div>
                  
                  <div className="space-y-3">
                      {/* Self Option */}
                      <button 
                         onClick={() => setAssignTo('self')}
                         className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                             assignTo === 'self' 
                             ? 'bg-vital-600/10 border-vital-600 text-white' 
                             : 'bg-dark-900 border-dark-700 text-gray-400 hover:border-gray-500'
                         }`}
                      >
                          <span className="font-bold">{t('planEditor.assignSelf')}</span>
                          {assignTo === 'self' && <div className="w-4 h-4 rounded-full bg-vital-500"></div>}
                      </button>

                      {/* Coach Mode: Client Options */}
                      {isCoachMode && (
                          <div className="space-y-2">
                              <p className="text-xs font-bold text-gray-500 uppercase px-1">{t('planEditor.selectClient')}</p>
                              {clients.map(client => (
                                  <button 
                                      key={client.id}
                                      onClick={() => setAssignTo(client.id)}
                                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                          assignTo === client.id 
                                          ? 'bg-blue-600/10 border-blue-600 text-white' 
                                          : 'bg-dark-900 border-dark-700 text-gray-400 hover:border-gray-500'
                                      }`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold">
                                              {client.name.charAt(0)}
                                          </div>
                                          <span className="font-medium text-sm">{client.name}</span>
                                      </div>
                                      {assignTo === client.id && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>

                  <button 
                    onClick={handleFinalSave}
                    className="w-full mt-6 bg-vital-600 hover:bg-vital-500 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg"
                  >
                      {t('planEditor.confirmAssignment')}
                  </button>
                  <button 
                    onClick={() => setAssignmentModalOpen(false)}
                    className="w-full mt-2 text-gray-500 py-2 font-medium text-sm hover:text-white"
                  >
                      {t('planEditor.cancel')}
                  </button>
              </div>
          </div>
      )}

      {/* History Modal Overlay */}
      {historyModalOpen && selectedHistory && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setHistoryModalOpen(false)}></div>
              <div className="bg-dark-800 border border-dark-700 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">{selectedHistory.name}</h3>
                      <button 
                        onClick={() => setHistoryModalOpen(false)}
                        className="text-gray-400 hover:text-white bg-dark-700 p-1 rounded-full"
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase">{t('planEditor.historyTitle')}</h4>
                      {selectedHistory.data.length > 0 ? (
                          <div className="space-y-2">
                              {selectedHistory.data.map((entry, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-dark-900 p-3 rounded-xl border border-dark-700/50">
                                      <span className="text-sm text-gray-400 font-medium">{entry.date}</span>
                                      <div className="text-right">
                                          <div className="text-sm font-bold text-white">{entry.weight} kg <span className="text-gray-500 font-normal">×</span> {entry.reps}</div>
                                          <div className="text-[10px] text-gray-500">RPE {entry.rpe}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-8 text-gray-500 text-sm">
                              {t('planEditor.noHistory')}
                          </div>
                      )}
                  </div>

                  <button 
                    onClick={() => setHistoryModalOpen(false)}
                    className="w-full mt-6 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                      {t('planEditor.close')}
                  </button>
              </div>
          </div>
      )}

      <header className="mt-2 flex items-center gap-4 flex-none">
        <button 
          onClick={() => onNavigate(isCoachMode ? View.COACH_DASHBOARD : View.PLANS)}
          className="bg-dark-800 p-2 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
            <h1 className="text-2xl font-bold text-white">{t('planEditor.title')}</h1>
            {isCoachMode && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Coach Mode</span>}
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar -mx-4 px-4 pb-20">
        
        {/* Basic Info */}
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('planEditor.nameLabel')}</label>
                <input 
                    type="text" 
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder={t('planEditor.namePlaceholder')}
                    className="w-full bg-dark-800 border border-dark-700 text-white rounded-xl px-4 py-3.5 focus:border-vital-500 outline-none transition-colors"
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('planEditor.descLabel')}</label>
                <textarea 
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('planEditor.descPlaceholder')}
                    className="w-full bg-dark-800 border border-dark-700 text-white rounded-xl px-4 py-3.5 focus:border-vital-500 outline-none transition-colors resize-none"
                />
            </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 gap-6 bg-dark-800 p-5 rounded-2xl border border-dark-700">
             <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t('planEditor.durationLabel')}</label>
                    <span className="text-sm font-bold text-vital-500">{duration} {t('plans.weeks')}</span>
                </div>
                <input 
                    type="range" 
                    min="4" 
                    max="16" 
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-vital-500"
                />
             </div>

             <div>
                <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">{t('planEditor.freqLabel')}</label>
                    <span className="text-sm font-bold text-vital-500">{freq} {t('planEditor.perWeek')}</span>
                </div>
                <input 
                    type="range" 
                    min="2" 
                    max="7" 
                    step="1"
                    value={freq}
                    onChange={(e) => setFreq(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-vital-500"
                />
             </div>
        </div>

        {/* Focus Selection */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">{t('planEditor.focusLabel')}</label>
            <div className="grid grid-cols-2 gap-3">
                {focusOptions.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setFocus(opt.id)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            focus === opt.id 
                            ? 'bg-vital-500/10 border-vital-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                            : 'bg-dark-800 border-dark-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-sm font-bold">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Exercises Section */}
        <div>
             <div className="flex justify-between items-center mb-3 px-1">
                <label className="block text-xs font-bold text-gray-500 uppercase">{t('planEditor.exercisesTitle')}</label>
                <span className="text-xs text-vital-500 font-bold bg-vital-500/10 px-2 py-0.5 rounded-full">{exercises.length}</span>
             </div>
             
             <div className="space-y-3">
                 {exercises.length === 0 && !isAdding && (
                     <div className="text-center py-8 border-2 border-dashed border-dark-700 rounded-xl">
                         <p className="text-gray-500 text-sm">{t('planEditor.noExercises')}</p>
                     </div>
                 )}

                 {exercises.map((ex, idx) => (
                    <ExerciseCard 
                        key={ex.id}
                        index={idx}
                        ex={ex}
                        isDragging={draggedIndex === idx}
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDragEnd={handleDragEnd}
                        onRemove={handleRemoveExercise}
                        onUpdate={updateExercise}
                        onViewHistory={handleViewHistory}
                        libraryExercises={libraryExercises}
                        t={t}
                    />
                 ))}

                 {/* Add Exercise UI */}
                 {isAdding ? (
                     <div className="bg-dark-800 border border-vital-500 rounded-xl p-4 animate-fade-in-up shadow-lg shadow-vital-500/10">
                         <div className="flex gap-2 mb-3">
                             <div className="relative flex-1">
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('planEditor.searchPlaceholder')}
                                    className="w-full bg-dark-900 pl-10 pr-10 py-2 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-vital-500"
                                />
                                {search.length > 0 && (
                                    <button 
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                             </div>
                             <button 
                                onClick={() => setIsAdding(false)}
                                className="text-gray-400 hover:text-white px-2"
                             >
                                 ✕
                             </button>
                         </div>

                         {/* Filters */}
                         <div className="mb-3 space-y-3">
                             {/* Filter Header with Clear Button */}
                             <div className="flex justify-between items-end px-1 h-6">
                                 <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                     {t('planEditor.filterMuscle')}
                                 </label>
                                 {(hasActiveFilters || search) && (
                                     <button 
                                         onClick={() => { setFilterCategory(null); setFilterEquipment(null); setSearch(''); }}
                                         className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md hover:bg-red-500/20 transition-colors flex items-center gap-1.5 animate-fade-in font-bold"
                                     >
                                         <span>{t('planEditor.clearFilters')}</span>
                                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                 )}
                             </div>

                             {/* Category Row */}
                             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                 <button
                                     onClick={() => setFilterCategory(null)}
                                     className={`flex-none px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${!filterCategory ? 'bg-vital-600 text-white border-vital-600 shadow-sm' : 'bg-dark-900 text-gray-400 border-dark-700 hover:border-gray-500'}`}
                                 >
                                     {t('planEditor.filterAll')}
                                 </button>
                                 {categoryOptions.map(opt => (
                                     <button
                                         key={opt.key}
                                         onClick={() => setFilterCategory(filterCategory === opt.key ? null : opt.key)}
                                         className={`flex-none px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                             filterCategory === opt.key 
                                             ? 'bg-vital-600 text-white border-vital-600 shadow-md shadow-vital-900/20' 
                                             : 'bg-dark-900 text-gray-400 border-dark-700 hover:border-gray-500'
                                         }`}
                                     >
                                         {opt.label}
                                     </button>
                                 ))}
                             </div>

                             <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-1">
                                {t('planEditor.filterEquip')}
                             </label>
                             
                             {/* Equipment Row */}
                             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                 {equipmentOptions.map(opt => (
                                     <button
                                         key={opt.key}
                                         onClick={() => setFilterEquipment(filterEquipment === opt.key ? null : opt.key)}
                                         className={`flex-none px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                             filterEquipment === opt.key 
                                             ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-900/20' 
                                             : 'bg-dark-900 text-gray-400 border-dark-700 hover:border-gray-500'
                                         }`}
                                     >
                                         {opt.label}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <div className="max-h-48 overflow-y-auto space-y-1">
                             {filteredExercises.map(ex => (
                                 <button
                                    key={ex.id}
                                    onClick={() => handleAddExercise(ex)}
                                    className="w-full text-left px-3 py-2 hover:bg-dark-700 rounded-lg flex justify-between items-center group transition-colors"
                                 >
                                     <span className="text-sm font-medium text-gray-200">{ex.name}</span>
                                     <div className="flex gap-2">
                                         <span className="text-[10px] text-gray-500 border border-dark-600 px-1.5 py-0.5 rounded uppercase">{ex.equipment}</span>
                                         <span className="text-[10px] text-vital-500 border border-vital-500/30 bg-vital-500/10 px-1.5 py-0.5 rounded uppercase">{ex.category}</span>
                                     </div>
                                 </button>
                             ))}
                             {filteredExercises.length === 0 && (
                                 <div className="text-center py-6 text-gray-500">
                                     <p className="text-xs">{t('planEditor.noMatches')}</p>
                                     {(hasActiveFilters || search) && (
                                         <button 
                                            onClick={() => { setFilterCategory(null); setFilterEquipment(null); setSearch(''); }}
                                            className="mt-2 text-xs text-vital-500 hover:underline"
                                         >
                                             {t('planEditor.clearFilters')}
                                         </button>
                                     )}
                                 </div>
                             )}
                         </div>
                     </div>
                 ) : (
                     <button 
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-dark-600 text-gray-400 hover:text-vital-500 hover:border-vital-500/50 hover:bg-vital-500/5 transition-all font-bold text-sm flex items-center justify-center gap-2"
                     >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                         {t('planEditor.addExercise')}
                     </button>
                 )}
             </div>
        </div>

      </div>

      <div className="flex gap-3 pt-4 flex-none border-t border-dark-800 bg-dark-900 mt-auto z-10">
        <button 
            onClick={() => onNavigate(isCoachMode ? View.COACH_DASHBOARD : View.PLANS)}
            className="flex-1 bg-dark-800 hover:bg-dark-700 text-gray-300 py-3.5 rounded-xl font-bold transition-colors"
        >
            {t('planEditor.cancel')}
        </button>
        <button 
            onClick={handlePreSave}
            className="flex-[2] bg-vital-600 hover:bg-vital-500 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-vital-900/40"
        >
            {t('planEditor.save')}
        </button>
      </div>
    </div>
  );
};

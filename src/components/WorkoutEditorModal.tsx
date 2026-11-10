import React, { useState } from 'react';
import { WorkoutPlan, WorkoutExercise } from '../types';
import {
  EXERCISES_LIBRARY,
  MUSCLE_GROUPS,
  cloneExerciseFromLibrary,
} from '../data/trainerData';
import { ExerciseVisual } from './ExerciseVisual';
import {
  X,
  Plus,
  Trash2,
  ArrowUpDown,
  Search,
  Check,
  RotateCcw,
  Clock,
  Dumbbell,
  ShieldAlert,
  Save,
  Filter,
} from 'lucide-react';

interface WorkoutEditorModalProps {
  isOpen: boolean;
  plan: WorkoutPlan | null;
  onClose: () => void;
  onSavePlan: (updatedPlan: WorkoutPlan) => void;
  onResetPlanToDefault: () => void;
}

export const WorkoutEditorModal: React.FC<WorkoutEditorModalProps> = ({
  isOpen,
  plan,
  onClose,
  onSavePlan,
  onResetPlanToDefault,
}) => {
  if (!isOpen || !plan) return null;

  // Local state for editing the exercises of the plan
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() =>
    plan.exercises.map((ex) => ({
      ...ex,
      seriesProgress: ex.seriesProgress.map((s) => ({ ...s })),
    }))
  );

  // State for replacing an exercise: holds index of exercise being replaced or 'new' for adding
  const [replacingIndex, setReplacingIndex] = useState<number | 'new' | null>(null);

  // Filter state for the exercise library drawer
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle replacing an exercise
  const handleSelectReplacement = (libExercise: WorkoutExercise) => {
    if (replacingIndex === 'new') {
      // Adding new exercise to end
      const cloned = cloneExerciseFromLibrary(libExercise.id, 'principal');
      if (cloned) {
        setExercises((prev) => [...prev, cloned]);
      }
    } else if (typeof replacingIndex === 'number' && replacingIndex >= 0) {
      // Replacing exercise at replacingIndex, keeping the phase
      const currentPhase = exercises[replacingIndex]?.phase || 'principal';
      const cloned = cloneExerciseFromLibrary(libExercise.id, currentPhase);
      if (cloned) {
        setExercises((prev) => {
          const next = [...prev];
          next[replacingIndex] = cloned;
          return next;
        });
      }
    }
    setReplacingIndex(null);
  };

  // Handle removing an exercise
  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 1) {
      alert('O treino deve ter pelo menos 1 exercício.');
      return;
    }
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle moving up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    setExercises((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Handle updating inline attributes
  const handleUpdateExerciseAttr = (
    index: number,
    field: 'sets' | 'repsRange' | 'restSeconds',
    value: any
  ) => {
    setExercises((prev) => {
      const next = [...prev];
      const target = { ...next[index] };

      if (field === 'sets') {
        const numSets = Math.max(1, Math.min(8, parseInt(value, 10) || 3));
        target.sets = numSets;
        // Adjust seriesProgress
        const newSeries = [];
        for (let i = 1; i <= numSets; i++) {
          newSeries.push({
            seriesIndex: i,
            completed: false,
            weightKg: target.seriesProgress[i - 1]?.weightKg || 20,
            repsDone: target.seriesProgress[i - 1]?.repsDone || 10,
          });
        }
        target.seriesProgress = newSeries;
      } else if (field === 'repsRange') {
        target.repsRange = value;
      } else if (field === 'restSeconds') {
        target.restSeconds = Math.max(15, Math.min(300, parseInt(value, 10) || 60));
      }

      next[index] = target;
      return next;
    });
  };

  // Save changes
  const handleSave = () => {
    // Recalculate estimated minutes: sum of (sets * 45s execution + restSeconds)
    const totalSeconds = exercises.reduce(
      (acc, ex) => acc + ex.sets * (45 + ex.restSeconds),
      0
    );
    const estimatedMinutes = Math.max(20, Math.round(totalSeconds / 60));

    const updatedPlan: WorkoutPlan = {
      ...plan,
      exercises,
      estimatedMinutes,
    };

    onSavePlan(updatedPlan);
    onClose();
  };

  // Filter library exercises
  const filteredLibrary = EXERCISES_LIBRARY.filter((ex) => {
    const matchesGroup =
      selectedMuscleGroup === 'todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] rounded-md border border-emerald-500/30">
                EDITOR DE TREINO
              </span>
              <span className="text-xs text-slate-300">
                Personalização de Séries, Cargas e Exercícios
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-white mt-1">
              {plan.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{exercises.length} Exercícios</strong> configurados neste treino (iniciando e finalizando com alongamento/mobilidade).
              </span>
            </div>

            <button
              onClick={() => {
                if (confirm('Deseja restaurar este treino para a estrutura padrão recomendada?')) {
                  onResetPlanToDefault();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Restaurar Padrão</span>
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {exercises.map((exercise, index) => {
              const isFirst = index === 0;
              const isLast = index === exercises.length - 1;

              return (
                <div
                  key={`${exercise.id}-${index}`}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3 sm:p-4 transition-all hover:bg-white hover:shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Left: Thumbnail & Name */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>

                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-900 shadow-xs">
                        <ExerciseVisual
                          exercise={exercise}
                          className="w-full h-full"
                          showBadge={false}
                          allowToggleView={false}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              exercise.phase === 'alongamento_inicial'
                                ? 'bg-sky-100 text-sky-800'
                                : exercise.phase === 'alongamento_final'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {exercise.phase === 'alongamento_inicial'
                              ? 'Alongamento Inicial'
                              : exercise.phase === 'alongamento_final'
                              ? 'Alongamento Final'
                              : 'Exercício Principal'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {exercise.targetMuscle}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {exercise.name}
                        </h4>
                      </div>
                    </div>

                    {/* Middle: Controls for Sets, Reps, Rest */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Séries:</span>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={exercise.sets}
                          onChange={(e) =>
                            handleUpdateExerciseAttr(index, 'sets', e.target.value)
                          }
                          className="w-12 px-1.5 py-1 text-center font-mono font-bold bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Reps:</span>
                        <input
                          type="text"
                          value={exercise.repsRange}
                          onChange={(e) =>
                            handleUpdateExerciseAttr(index, 'repsRange', e.target.value)
                          }
                          className="w-24 px-1.5 py-1 text-center font-mono font-bold bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          min="15"
                          max="300"
                          step="15"
                          value={exercise.restSeconds}
                          onChange={(e) =>
                            handleUpdateExerciseAttr(index, 'restSeconds', e.target.value)
                          }
                          className="w-14 px-1 py-1 text-center font-mono font-bold bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <span className="text-[10px] text-slate-500">s</span>
                      </div>
                    </div>

                    {/* Right: Actions (Change, Move, Delete) */}
                    <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => setReplacingIndex(index)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Substituir por outro exercício do catálogo"
                      >
                        Trocar
                      </button>

                      <div className="flex flex-col">
                        <button
                          disabled={isFirst}
                          onClick={() => handleMove(index, 'up')}
                          className={`p-1 text-slate-500 hover:text-slate-900 rounded ${
                            isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-200'
                          }`}
                          title="Mover para cima"
                        >
                          ▲
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => handleMove(index, 'down')}
                          className={`p-1 text-slate-500 hover:text-slate-900 rounded ${
                            isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-200'
                          }`}
                          title="Mover para baixo"
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover exercício"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Exercise Button */}
          <button
            onClick={() => setReplacingIndex('new')}
            className="w-full py-3.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Adicionar Exercício ao Treino (Catálogo com mais de 55 opções)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Total: <strong className="text-slate-800">{exercises.length} exercícios</strong> ·
            Estimativa: <strong className="text-slate-800">~{Math.round(exercises.reduce((acc, ex) => acc + ex.sets * (45 + ex.restSeconds), 0) / 60)} min</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[42px]"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Treino</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- EXERCISE SELECTION DRAWER / MODAL --- */}
      {replacingIndex !== null && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                  {replacingIndex === 'new'
                    ? 'Adicionar Novo Exercício'
                    : `Trocar Exercício #${typeof replacingIndex === 'number' ? replacingIndex + 1 : 1}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione entre mais de 55 exercícios divididos por grupo muscular com execução correta
                </p>
              </div>

              <button
                onClick={() => setReplacingIndex(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Muscle Group Filters */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedMuscleGroup('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMuscleGroup === 'todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({EXERCISES_LIBRARY.length})
              </button>

              {MUSCLE_GROUPS.map((mg) => {
                const count = EXERCISES_LIBRARY.filter((e) => e.muscleGroup === mg.id).length;
                return (
                  <button
                    key={mg.id}
                    onClick={() => setSelectedMuscleGroup(mg.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                      selectedMuscleGroup === mg.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{mg.icon}</span>
                    <span>{mg.label}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome do exercício ou músculo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Exercise Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLibrary.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectReplacement(item)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 bg-white transition-all cursor-pointer flex gap-3 group"
                  >
                    <div className="w-18 h-18 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-900 shadow-xs">
                      <ExerciseVisual
                        exercise={item}
                        className="w-full h-full"
                        showBadge={false}
                        allowToggleView={false}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {item.targetMuscle}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.scientificTarget}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-600">
                        <span>{item.sets} séries</span>
                        <span>·</span>
                        <span>{item.repsRange}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Project, ProjectInput, SprintTask, EvidenceLog } from './types';
import {
  loadProjects,
  saveProject,
  deleteProject,
  updateProjectTask,
  addEvidenceLog,
  updateEvidenceLog,
  deleteEvidenceLog,
  getActiveProjectId,
  setActiveProjectId,
} from './utils/storage';
import { DEMO_PROJECT, EXAMPLE_PRESETS } from './utils/presets';
import { analyzeProjectIdea, synthesizeProjectReview } from './utils/api';
import { Sidebar } from './components/Sidebar';
import { ProjectHeader } from './components/ProjectHeader';
import { StrategyView } from './components/StrategyView';
import { SprintView } from './components/SprintView';
import { EvidenceView } from './components/EvidenceView';
import { ReviewView } from './components/ReviewView';
import { ProgressTracker } from './components/ProgressTracker';
import { WhatIfModal } from './components/WhatIfModal';
import { CaptureModal } from './components/CaptureModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EditTaskModal } from './components/EditTaskModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { WhatIfScenarioResult } from './types';
import { Plus, Sparkles, BookOpen, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'strategy' | 'sprint' | 'evidence' | 'review'>('sprint');

  // Modals & Drawers
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<SprintTask | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynthesizingReview, setIsSynthesizingReview] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize projects on first load
  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    const active = getActiveProjectId(loaded);
    setActiveId(active);
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || DEMO_PROJECT;

  const handleSelectProject = (id: string) => {
    setActiveId(id);
    setActiveProjectId(id);
    setGlobalError(null);
  };

  const handleOpenNewSprintModal = () => {
    setIsEditingInput(false);
    setIsCaptureModalOpen(true);
  };

  const handleOpenEditParameters = () => {
    setIsEditingInput(true);
    setIsCaptureModalOpen(true);
  };

  const handleSaveOrAnalyze = async (input: ProjectInput) => {
    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const response = await analyzeProjectIdea(input);

      let targetProject: Project;
      if (isEditingInput && activeProject) {
        targetProject = {
          ...activeProject,
          input,
          strategy: response.strategy,
          sprintTasks: response.sprintTasks,
          updatedAt: new Date().toISOString(),
        };
      } else {
        targetProject = {
          id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: false,
          input,
          strategy: response.strategy,
          sprintTasks: response.sprintTasks,
          evidenceLogs: [],
          review: null,
        };
      }

      const updatedList = saveProject(targetProject);
      setProjects(updatedList);
      setActiveId(targetProject.id);
      setActiveProjectId(targetProject.id);
      setIsCaptureModalOpen(false);
      setActiveTab('strategy'); // Switch to Strategy to see the analysis first
    } catch (err: any) {
      console.error('Error analyzing project:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteRequest = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteCandidateId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidateId) return;
    const remaining = deleteProject(deleteCandidateId);
    setProjects(remaining);
    const nextActive = remaining[0]?.id || '';
    setActiveId(nextActive);
    setActiveProjectId(nextActive);
    setDeleteCandidateId(null);
  };

  const handleToggleTask = (taskId: string, isCompleted: boolean) => {
    if (!activeProject) return;
    const updated = updateProjectTask(activeProject.id, taskId, { isCompleted });
    if (updated) {
      const nextList = projects.map((p) => (p.id === updated.id ? updated : p));
      setProjects(nextList);
    }
  };

  const handleSaveEditedTask = (taskId: string, patch: Partial<SprintTask>) => {
    if (!activeProject) return;
    const updated = updateProjectTask(activeProject.id, taskId, patch);
    if (updated) {
      const nextList = projects.map((p) => (p.id === updated.id ? updated : p));
      setProjects(nextList);
    }
  };

  const handleAddTaskForDay = (dayNumber: number) => {
    if (!activeProject) return;
    const newTask: SprintTask = {
      id: `task-d${dayNumber}-${Date.now()}`,
      dayNumber,
      title: `Day ${dayNumber} Task`,
      description: 'Define specific validation step.',
      estimatedHours: 1.5,
      deliverable: 'Tangible validation artifact.',
      dependencies: dayNumber > 1 ? [`Day ${dayNumber - 1}`] : ['None'],
      isCompleted: false,
    };
    const updated: Project = {
      ...activeProject,
      sprintTasks: [...activeProject.sprintTasks, newTask],
      updatedAt: new Date().toISOString(),
    };
    saveProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setEditingTask(newTask);
  };

  const handleRebalanceEffort = (rebalancedTasks: SprintTask[]) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      sprintTasks: rebalancedTasks,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updated);
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddEvidence = (log: Omit<EvidenceLog, 'id'>) => {
    if (!activeProject) return;
    const updated = addEvidenceLog(activeProject.id, log);
    if (updated) {
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleUpdateEvidence = (id: string, patch: Partial<EvidenceLog>) => {
    if (!activeProject) return;
    const updated = updateEvidenceLog(activeProject.id, id, patch);
    if (updated) {
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleDeleteEvidence = (id: string) => {
    if (!activeProject) return;
    const updated = deleteEvidenceLog(activeProject.id, id);
    if (updated) {
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const handleSynthesizeReview = async () => {
    if (!activeProject || !activeProject.strategy) return;
    setIsSynthesizingReview(true);
    setGlobalError(null);

    try {
      const reviewResult = await synthesizeProjectReview(
        activeProject.strategy,
        activeProject.evidenceLogs,
        activeProject.sprintTasks
      );

      const updated: Project = {
        ...activeProject,
        review: reviewResult,
        updatedAt: new Date().toISOString(),
      };
      saveProject(updated);
      setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      console.error('Error synthesizing review:', err);
      setGlobalError(err.message || 'Failed to synthesize review verdict. Please retry.');
    } finally {
      setIsSynthesizingReview(false);
    }
  };

  const handleApplyWhatIfScenario = (scenario: WhatIfScenarioResult) => {
    if (!activeProject) return;

    const updatedTasks: SprintTask[] = scenario.adjustedExecutionPlan.map((d, idx) => ({
      id: `task-whatif-d${d.dayNumber}-${Date.now()}-${idx}`,
      dayNumber: d.dayNumber,
      title: d.title,
      description: `${d.shiftFromOriginal}. Deliverable: ${d.revisedDeliverable}`,
      estimatedHours: d.estimatedHours,
      deliverable: d.revisedDeliverable,
      dependencies: d.dayNumber > 1 ? [`Day ${d.dayNumber - 1}`] : ['None'],
      isCompleted: false,
    }));

    const nextCapacity = scenario.suggestedCapacityChange || activeProject.input.hoursPerWeek;
    const nextBudget = scenario.suggestedBudgetChange || activeProject.input.budgetAmount;

    const updatedProject: Project = {
      ...activeProject,
      input: {
        ...activeProject.input,
        hoursPerWeek: nextCapacity,
        budgetAmount: nextBudget,
      },
      strategy: activeProject.strategy
        ? {
            ...activeProject.strategy,
            recommendedApproach: {
              ...activeProject.strategy.recommendedApproach,
              reasoning: `${activeProject.strategy.recommendedApproach.reasoning} (Revised per scenario: "${scenario.scenarioPrompt}")`,
            },
          }
        : null,
      sprintTasks: updatedTasks.length > 0 ? updatedTasks : activeProject.sprintTasks,
      scenarios: [scenario, ...(activeProject.scenarios || [])],
      updatedAt: new Date().toISOString(),
    };

    saveProject(updatedProject);
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setActiveTab('sprint');
  };

  const handleForkWhatIfScenario = (scenario: WhatIfScenarioResult) => {
    if (!activeProject) return;

    const nextCapacity = scenario.suggestedCapacityChange || activeProject.input.hoursPerWeek;
    const nextBudget = scenario.suggestedBudgetChange || activeProject.input.budgetAmount;

    const forkedTasks: SprintTask[] = scenario.adjustedExecutionPlan.map((d, idx) => ({
      id: `task-fork-d${d.dayNumber}-${Date.now()}-${idx}`,
      dayNumber: d.dayNumber,
      title: d.title,
      description: `${d.shiftFromOriginal}. Deliverable: ${d.revisedDeliverable}`,
      estimatedHours: d.estimatedHours,
      deliverable: d.revisedDeliverable,
      dependencies: d.dayNumber > 1 ? [`Day ${d.dayNumber - 1}`] : ['None'],
      isCompleted: false,
    }));

    const forkedProject: Project = {
      ...activeProject,
      id: `proj-fork-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
      input: {
        ...activeProject.input,
        title: `[Scenario] ${activeProject.input.title} (${scenario.scenarioPrompt.slice(0, 24)}...)`,
        hoursPerWeek: nextCapacity,
        budgetAmount: nextBudget,
      },
      sprintTasks: forkedTasks.length > 0 ? forkedTasks : activeProject.sprintTasks,
      scenarios: [scenario],
    };

    const nextList = saveProject(forkedProject);
    setProjects(nextList);
    setActiveId(forkedProject.id);
    setActiveProjectId(forkedProject.id);
    setActiveTab('sprint');
  };

  const handleImportProject = (imported: Project) => {
    const projectWithFreshDate: Project = {
      ...imported,
      id: imported.id ? (projects.some((p) => p.id === imported.id) ? `proj-imp-${Date.now()}` : imported.id) : `proj-imp-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const nextList = saveProject(projectWithFreshDate);
    setProjects(nextList);
    setActiveId(projectWithFreshDate.id);
    setActiveProjectId(projectWithFreshDate.id);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleOpenNewSprintModal}
        onDeleteRequest={(id, e) => handleDeleteRequest(id, e)}
        onOpenTests={() => setIsTestModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 md:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Workspace Top Header */}
        <ProjectHeader
          project={activeProject}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEditInput={handleOpenEditParameters}
          onDeleteRequest={() => handleDeleteRequest(activeProject.id)}
          onImportProject={handleImportProject}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Global Error Banner if any */}
        {globalError && (
          <div className="mx-4 md:mx-8 mt-4 p-3.5 bg-rose-950/50 border border-rose-900 rounded-lg text-xs text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Visual Progress Tracker Dashboard Strip */}
        <div className="px-4 md:px-8 pt-6">
          <ProgressTracker
            tasks={activeProject.sprintTasks}
            capacityHours={activeProject.input.hoursPerWeek}
          />
        </div>

        {/* Tab Viewport */}
        <main className="flex-1 pb-16">
          {activeTab === 'strategy' && (
            <StrategyView
              strategy={activeProject.strategy}
              input={activeProject.input}
              scenarios={activeProject.scenarios}
              onGoToSprint={() => setActiveTab('sprint')}
              onRegenerate={handleOpenEditParameters}
              onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
              isGenerating={isAnalyzing}
            />
          )}

          {activeTab === 'sprint' && (
            <SprintView
              tasks={activeProject.sprintTasks}
              capacityHours={activeProject.input.hoursPerWeek}
              onToggleTask={handleToggleTask}
              onEditTask={(task) => setEditingTask(task)}
              onAddTask={handleAddTaskForDay}
              onRebalanceEffort={handleRebalanceEffort}
              onGoToEvidence={() => setActiveTab('evidence')}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceView
              logs={activeProject.evidenceLogs}
              onAddLog={handleAddEvidence}
              onUpdateLog={handleUpdateEvidence}
              onDeleteLog={handleDeleteEvidence}
              onGoToReview={() => setActiveTab('review')}
            />
          )}

          {activeTab === 'review' && (
            <ReviewView
              review={activeProject.review}
              strategy={activeProject.strategy}
              evidenceLogs={activeProject.evidenceLogs}
              sprintTasks={activeProject.sprintTasks}
              onSynthesizeReview={handleSynthesizeReview}
              isSynthesizing={isSynthesizingReview}
            />
          )}
        </main>
      </div>

      {/* Capture / Edit Modal */}
      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onSubmit={handleSaveOrAnalyze}
        initialInput={isEditingInput ? activeProject.input : undefined}
        isSubmitting={isAnalyzing}
      />

      {/* AI What-If Scenario Simulator Modal */}
      <WhatIfModal
        isOpen={isWhatIfModalOpen}
        project={activeProject}
        onClose={() => setIsWhatIfModalOpen(false)}
        onApplyScenario={handleApplyWhatIfScenario}
        onForkProject={handleForkWhatIfScenario}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteCandidateId}
        projectTitle={
          projects.find((p) => p.id === deleteCandidateId)?.input.title || 'Untitled Sprint'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidateId(null)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEditedTask}
      />

      {/* Diagnostic Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}

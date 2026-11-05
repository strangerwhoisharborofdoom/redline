import { Project, SprintTask, EvidenceLog } from '../types';
import { DEMO_PROJECT } from './presets';

const STORAGE_KEY = 'redline_projects_v1';
const ACTIVE_PROJECT_KEY = 'redline_active_project_id_v1';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: Seed with the clearly labelled Demo project
      saveProjects([DEMO_PROJECT]);
      return [DEMO_PROJECT];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveProjects([DEMO_PROJECT]);
      return [DEMO_PROJECT];
    }
    return parsed;
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return [DEMO_PROJECT];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
}

export function getActiveProjectId(projects: Project[]): string {
  try {
    const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (savedId && projects.some((p) => p.id === savedId)) {
      return savedId;
    }
  } catch {
    // fallback
  }
  return projects[0]?.id || DEMO_PROJECT.id;
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch (err) {
    console.error('Error saving active project id:', err);
  }
}

export function saveProject(project: Project): Project[] {
  const current = loadProjects();
  const existingIndex = current.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: new Date().toISOString() };
  let nextList: Project[];
  if (existingIndex >= 0) {
    nextList = [...current];
    nextList[existingIndex] = updated;
  } else {
    nextList = [updated, ...current];
  }
  saveProjects(nextList);
  return nextList;
}

export function deleteProject(id: string): Project[] {
  const current = loadProjects();
  const filtered = current.filter((p) => p.id !== id);
  // Ensure there's always at least something or empty
  saveProjects(filtered);
  return filtered;
}

export function updateProjectTask(
  projectId: string,
  taskId: string,
  patch: Partial<SprintTask>
): Project | null {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const nextTasks = project.sprintTasks.map((t) => {
    if (t.id === taskId) {
      const isNowCompleted = patch.isCompleted !== undefined ? patch.isCompleted : t.isCompleted;
      const completedAt =
        patch.isCompleted !== undefined
          ? patch.isCompleted
            ? new Date().toISOString()
            : undefined
          : t.completedAt;
      return { ...t, ...patch, isCompleted: isNowCompleted, completedAt };
    }
    return t;
  });

  const updatedProject: Project = {
    ...project,
    sprintTasks: nextTasks,
    updatedAt: new Date().toISOString(),
  };

  saveProject(updatedProject);
  return updatedProject;
}

export function addEvidenceLog(projectId: string, log: Omit<EvidenceLog, 'id'>): Project | null {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const newLog: EvidenceLog = {
    ...log,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };

  const updatedProject: Project = {
    ...project,
    evidenceLogs: [newLog, ...project.evidenceLogs],
    updatedAt: new Date().toISOString(),
  };

  saveProject(updatedProject);
  return updatedProject;
}

export function updateEvidenceLog(
  projectId: string,
  logId: string,
  patch: Partial<EvidenceLog>
): Project | null {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const updatedLogs = project.evidenceLogs.map((log) => {
    if (log.id === logId) {
      return { ...log, ...patch };
    }
    return log;
  });

  const updatedProject: Project = {
    ...project,
    evidenceLogs: updatedLogs,
    updatedAt: new Date().toISOString(),
  };

  saveProject(updatedProject);
  return updatedProject;
}

export function deleteEvidenceLog(projectId: string, logId: string): Project | null {
  const projects = loadProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const updatedLogs = project.evidenceLogs.filter((l) => l.id !== logId);
  const updatedProject: Project = {
    ...project,
    evidenceLogs: updatedLogs,
    updatedAt: new Date().toISOString(),
  };

  saveProject(updatedProject);
  return updatedProject;
}

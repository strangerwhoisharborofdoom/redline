import { ProjectInput, StrategyAnalysis, SprintTask, EvidenceLog, ReviewSynthesis } from '../types';

export interface AnalyzeResponse {
  strategy: StrategyAnalysis;
  sprintTasks: SprintTask[];
  isDemoOrFallback: boolean;
  fallbackReason?: string;
  modelIdentifier?: string;
}

export async function analyzeProjectIdea(
  input: ProjectInput,
  forceDemoMode: boolean = false
): Promise<AnalyzeResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input, forceDemoMode }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server responded with status ${res.status}`);
  }

  return res.json();
}

export async function synthesizeProjectReview(
  strategy: StrategyAnalysis,
  evidenceLogs: EvidenceLog[],
  sprintTasks: SprintTask[],
  forceDemoMode: boolean = false
): Promise<ReviewSynthesis> {
  const res = await fetch('/api/synthesize-review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ strategy, evidenceLogs, sprintTasks, forceDemoMode }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server responded with status ${res.status}`);
  }

  return res.json();
}

export async function analyzeWhatIfScenario(
  currentProject: import('../types').Project,
  scenarioPrompt: string,
  forceDemoMode: boolean = false
): Promise<import('../types').WhatIfScenarioResult> {
  const res = await fetch('/api/what-if', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentProject, scenarioPrompt, forceDemoMode }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server responded with status ${res.status}`);
  }

  return res.json();
}

export async function checkServerHealth(): Promise<{
  status: string;
  hasGeminiKey: boolean;
  model: string;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'down', hasGeminiKey: false, model: 'none' };
    return res.json();
  } catch {
    return { status: 'offline', hasGeminiKey: false, model: 'none' };
  }
}

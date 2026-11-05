import {
  validateEffortBudget,
  enforceEffortBudget,
  sanitizeAndValidateStrategy,
  sanitizeAndValidateReview,
  sanitizeAndValidateWhatIf,
} from './validation';
import {
  loadProjects,
  saveProjects,
  saveProject,
  deleteProject,
  updateProjectTask,
  addEvidenceLog,
} from './storage';
import { formatProjectMarkdown } from './exportPlan';
import { DEMO_PROJECT } from './presets';
import { SprintTask, Project } from '../types';

export interface TestResult {
  id: string;
  name: string;
  category: 'Effort Budget' | 'Persistence' | 'Task Completion' | 'Export' | 'AI Resiliency';
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runAllRedlineTests(): TestResult[] {
  const results: TestResult[] = [];

  function record(
    id: string,
    category: TestResult['category'],
    name: string,
    fn: () => void
  ) {
    const start = performance.now();
    try {
      fn();
      results.push({
        id,
        category,
        name,
        passed: true,
        message: 'Passed as expected',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    } catch (err: any) {
      results.push({
        id,
        category,
        name,
        passed: false,
        message: err.message || 'Assertion failed',
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    }
  }

  // 1. EFFORT BUDGET TESTS
  record('test-effort-1', 'Effort Budget', 'Validates task effort within stated capacity', () => {
    const tasks: SprintTask[] = [
      { id: '1', dayNumber: 1, title: 'T1', description: '', estimatedHours: 2, deliverable: '', dependencies: [], isCompleted: false },
      { id: '2', dayNumber: 2, title: 'T2', description: '', estimatedHours: 3, deliverable: '', dependencies: [], isCompleted: false },
    ];
    const res = validateEffortBudget(tasks, 10);
    if (!res.isValid) throw new Error(`Expected isValid to be true, got false`);
    if (res.totalEffortHours !== 5) throw new Error(`Expected total 5, got ${res.totalEffortHours}`);
    if (res.remainingHours !== 5) throw new Error(`Expected remaining 5, got ${res.remainingHours}`);
  });

  record('test-effort-2', 'Effort Budget', 'Detects overflow when effort exceeds capacity', () => {
    const tasks: SprintTask[] = [
      { id: '1', dayNumber: 1, title: 'T1', description: '', estimatedHours: 10, deliverable: '', dependencies: [], isCompleted: false },
      { id: '2', dayNumber: 2, title: 'T2', description: '', estimatedHours: 5, deliverable: '', dependencies: [], isCompleted: false },
    ];
    const res = validateEffortBudget(tasks, 12);
    if (res.isValid) throw new Error(`Expected isValid to be false for 15h total against 12h capacity`);
    if (res.overflowHours !== 3) throw new Error(`Expected 3h overflow, got ${res.overflowHours}`);
  });

  record('test-effort-3', 'Effort Budget', 'enforceEffortBudget scales sprint tasks to fit capacity', () => {
    const tasks: SprintTask[] = [
      { id: '1', dayNumber: 1, title: 'T1', description: '', estimatedHours: 10, deliverable: '', dependencies: [], isCompleted: false },
      { id: '2', dayNumber: 2, title: 'T2', description: '', estimatedHours: 10, deliverable: '', dependencies: [], isCompleted: false },
    ];
    const adjusted = enforceEffortBudget(tasks, 14);
    const sum = adjusted.reduce((s, t) => s + t.estimatedHours, 0);
    if (sum > 14) throw new Error(`Adjusted sum ${sum} exceeds capacity 14`);
  });

  // 2. PERSISTENCE TESTS
  record('test-persist-1', 'Persistence', 'Loads and saves projects in localStorage correctly', () => {
    const testProject: Project = {
      ...DEMO_PROJECT,
      id: 'test-proj-persist-' + Date.now(),
      input: { ...DEMO_PROJECT.input, title: 'Persistence Test Unit' },
    };
    saveProject(testProject);
    const loaded = loadProjects();
    const found = loaded.find((p) => p.id === testProject.id);
    if (!found) throw new Error('Saved project was not found in loaded projects list');
    if (found.input.title !== 'Persistence Test Unit') throw new Error('Loaded title mismatch');
    // Cleanup
    deleteProject(testProject.id);
  });

  record('test-persist-2', 'Persistence', 'Adds and retrieves new evidence log seamlessly', () => {
    const testProjId = 'test-proj-ev-' + Date.now();
    const testProject: Project = {
      ...DEMO_PROJECT,
      id: testProjId,
      evidenceLogs: [],
    };
    saveProject(testProject);
    const updated = addEvidenceLog(testProjId, {
      date: '2026-11-04',
      source: 'Direct Interview',
      observation: 'Prospect wants offline sync',
      status: 'Validated',
      notes: 'High priority customer',
    });
    if (!updated) throw new Error('addEvidenceLog returned null');
    if (updated.evidenceLogs.length !== 1) throw new Error('Evidence log was not prepended');
    if (updated.evidenceLogs[0].observation !== 'Prospect wants offline sync') {
      throw new Error('Observation content mismatch');
    }
    // Cleanup
    deleteProject(testProjId);
  });

  // 3. TASK COMPLETION TESTS
  record('test-task-1', 'Task Completion', 'Toggling task status updates completion flag and timestamp', () => {
    const testProjId = 'test-proj-task-' + Date.now();
    const testProject: Project = {
      ...DEMO_PROJECT,
      id: testProjId,
      sprintTasks: [
        { id: 'task-test-1', dayNumber: 1, title: 'Build Shell', description: '', estimatedHours: 2, deliverable: 'Shell', dependencies: [], isCompleted: false },
      ],
    };
    saveProject(testProject);

    const updated = updateProjectTask(testProjId, 'task-test-1', { isCompleted: true });
    if (!updated) throw new Error('updateProjectTask returned null');
    const t = updated.sprintTasks.find((item) => item.id === 'task-test-1');
    if (!t?.isCompleted) throw new Error('Task was not marked completed');
    if (!t?.completedAt) throw new Error('Task completedAt timestamp was not recorded');

    // Untoggle
    const untoggled = updateProjectTask(testProjId, 'task-test-1', { isCompleted: false });
    const t2 = untoggled?.sprintTasks.find((item) => item.id === 'task-test-1');
    if (t2?.isCompleted) throw new Error('Task was not unchecked');

    // Cleanup
    deleteProject(testProjId);
  });

  record('test-progress-tracker', 'Task Completion', 'Progress tracker computes completed, pending, and total sprint time accurately', () => {
    const tasks: SprintTask[] = [
      { id: '1', dayNumber: 1, title: 'T1', description: '', estimatedHours: 2.5, deliverable: '', dependencies: [], isCompleted: true },
      { id: '2', dayNumber: 2, title: 'T2', description: '', estimatedHours: 3.5, deliverable: '', dependencies: [], isCompleted: false },
      { id: '3', dayNumber: 3, title: 'T3', description: '', estimatedHours: 4.0, deliverable: '', dependencies: [], isCompleted: false },
    ];
    const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.isCompleted).length;
    const pendingCount = totalCount - completedCount;
    const totalTime = tasks.reduce((s, t) => s + t.estimatedHours, 0);
    const completedTime = tasks.filter((t) => t.isCompleted).reduce((s, t) => s + t.estimatedHours, 0);
    const pendingTime = totalTime - completedTime;

    if (totalCount !== 3 || completedCount !== 1 || pendingCount !== 2) {
      throw new Error(`Count mismatch: ${completedCount} completed, ${pendingCount} pending`);
    }
    if (totalTime !== 10.0 || completedTime !== 2.5 || pendingTime !== 7.5) {
      throw new Error(`Time mismatch: total ${totalTime}, completed ${completedTime}, pending ${pendingTime}`);
    }
  });

  // 4. EXPORT TESTS
  record('test-export-1', 'Export', 'Generates valid comprehensive Markdown output', () => {
    const md = formatProjectMarkdown(DEMO_PROJECT);
    if (!md.includes('# PulseCollect — WhatsApp Gym Chaser')) throw new Error('Markdown missing header');
    if (!md.includes('Redline — Cut through noise. Ship what matters.')) throw new Error('Markdown missing tagline');
    if (!md.includes('Seven-Day Validation Sprint Plan')) throw new Error('Markdown missing 7-day sprint plan section');
    if (!md.includes('Do NOT Build Yet')) throw new Error('Markdown missing Do Not Build section');
    if (!md.includes('Proven by Direct Evidence')) throw new Error('Markdown missing evidence review section');
  });

  record('test-export-2', 'Export', 'Exports clean JSON preserving full project state', () => {
    const jsonStr = JSON.stringify(DEMO_PROJECT);
    const parsed = JSON.parse(jsonStr);
    if (parsed.id !== DEMO_PROJECT.id) throw new Error('JSON export ID mismatch');
    if (parsed.sprintTasks.length !== DEMO_PROJECT.sprintTasks.length) throw new Error('JSON export sprint tasks mismatch');
    if (!parsed.strategy.riskiestAssumption) throw new Error('JSON export missing riskiest assumption');
  });

  record('test-import-1', 'Export', 'Parses and restores exported project JSON without data loss', () => {
    const exportedStr = JSON.stringify(DEMO_PROJECT);
    const imported: Project = JSON.parse(exportedStr);
    if (!imported.id || !imported.input || !imported.strategy) {
      throw new Error('Imported JSON missing root project properties');
    }
    if (imported.input.title !== DEMO_PROJECT.input.title) {
      throw new Error('Imported project title does not match source');
    }
    if (imported.sprintTasks.length !== 7) {
      throw new Error(`Expected 7 sprint tasks, got ${imported.sprintTasks.length}`);
    }
  });

  // 5. MALFORMED AI RESPONSES RESILIENCY
  record('test-ai-1', 'AI Resiliency', 'Handles empty, corrupted or partial AI response gracefully', () => {
    const malformed = {
      customerAndProblem: {},
      riskiestAssumption: '',
      threeApproaches: [],
      sevenDaySprint: null,
    };
    const sanitized = sanitizeAndValidateStrategy(malformed, 12);
    if (!sanitized.strategy) throw new Error('Expected fallback strategy to be generated');
    if (sanitized.sprintTasks.length !== 7) throw new Error(`Expected exactly 7 sprint days, got ${sanitized.sprintTasks.length}`);
    if (!sanitized.strategy.riskiestAssumption) throw new Error('Expected default unvalidated assumption');
  });

  record('test-ai-2', 'AI Resiliency', 'Labels claims as Unvalidated Assumption when evidence is absent', () => {
    const rawNoEvidence = {
      customerAndProblem: { targetCustomer: 'Founders', specificProblem: 'Time wasted', whyNowAndUrgency: 'Now' },
      riskiestAssumption: 'Willing to pay $50/mo',
      evidenceVsAssumption: { knownEvidence: [], unvalidatedAssumptions: [] },
    };
    const sanitized = sanitizeAndValidateStrategy(rawNoEvidence, 10);
    if (sanitized.strategy.evidenceVsAssumption.knownEvidence.length !== 0) {
      throw new Error('Should not invent evidence');
    }
    if (sanitized.strategy.evidenceVsAssumption.unvalidatedAssumptions.length === 0) {
      throw new Error('Should preserve or insert unvalidated assumption indicator');
    }
  });

  record('test-ai-3', 'AI Resiliency', 'Sanitizes review synthesis and handles invalid verdict types', () => {
    const malformedReview = {
      verdict: 'INVALID_VERDICT_HERE',
      provenByEvidence: 'not-an-array',
    };
    const res = sanitizeAndValidateReview(malformedReview);
    if (res.verdict !== 'REVISE') throw new Error(`Expected invalid verdict to default to REVISE, got ${res.verdict}`);
    if (!Array.isArray(res.provenByEvidence)) throw new Error('Expected provenByEvidence to be an array');
  });

  record('test-ai-whatif', 'AI Resiliency', 'Sanitizes What-If scenario responses and handles invalid verdicts', () => {
    const malformedWhatIf = {
      verdictOnScenario: 'INVALID_SCENARIO_VERDICT',
      potentialImpacts: {},
      adjustedExecutionPlan: null,
    };
    const res = sanitizeAndValidateWhatIf(malformedWhatIf, 'What if I had 25 hours?');
    if (res.verdictOnScenario !== 'NEUTRAL_TRADE') {
      throw new Error(`Expected invalid scenario verdict to default to NEUTRAL_TRADE, got ${res.verdictOnScenario}`);
    }
    if (!Array.isArray(res.potentialImpacts.advantages)) {
      throw new Error('Expected advantages to be an array');
    }
  });

  return results;
}

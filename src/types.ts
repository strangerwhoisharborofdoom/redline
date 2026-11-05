export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
};

export interface ProjectInput {
  title: string;
  idea: string; // "What are you trying to build?"
  targetCustomer: string;
  hoursPerWeek: number;
  budgetAmount: number;
  budgetCurrency: CurrencyCode;
  skills: string[];
  biggestConstraint: string;
}

export interface Approach {
  title: string;
  pros: string[];
  cons: string[];
  tradeoffs: string;
  estimatedDaysToValidate: number;
}

export interface StrategyAnalysis {
  customerAndProblem: {
    targetCustomer: string;
    specificProblem: string;
    whyNowAndUrgency: string;
  };
  riskiestAssumption: string;
  evidenceVsAssumption: {
    knownEvidence: string[];
    unvalidatedAssumptions: string[];
  };
  threeApproaches: Approach[];
  recommendedApproach: {
    approachTitle: string;
    reasoning: string;
    whyNotOthers: string;
  };
  narrowMvpScope: string[];
  doNotBuildYet: string[];
  validationExperiment: {
    title: string;
    description: string;
    channel: string;
    estimatedCost: string;
  };
  successThreshold: string;
  stopOrPivotCondition: string;
  isDemoOrFallback?: boolean;
  generatedAt: string;
  modelIdentifier?: string;
}

export interface SprintTask {
  id: string;
  dayNumber: number; // 1 to 7
  title: string;
  description: string;
  estimatedHours: number;
  actualHoursSpent?: number;
  deliverable: string;
  dependencies: string[];
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export type EvidenceStatus = 'Validated' | 'Invalidated' | 'Inconclusive';

export interface EvidenceLog {
  id: string;
  date: string;
  source: string; // e.g., "5 Prospect DMs", "Typeform Survey", "Landing page analytics"
  observation: string;
  status: EvidenceStatus;
  notes?: string;
}

export type ReviewVerdict = 'CONTINUE' | 'REVISE' | 'STOP';

export interface ReviewSynthesis {
  verdict: ReviewVerdict;
  verdictSummary: string;
  provenByEvidence: string[];
  unvalidatedAssumptions: string[];
  immediateNextStep: string;
  detailedRationale: string;
  generatedAt: string;
  isDemoOrFallback?: boolean;
}

export type ScenarioVerdict = 'WORTHWHILE_SHIFT' | 'DISTRACTING_NOISE' | 'NEUTRAL_TRADE';

export interface AdjustedSprintDay {
  dayNumber: number;
  title: string;
  estimatedHours: number;
  revisedDeliverable: string;
  shiftFromOriginal: string;
}

export interface WhatIfScenarioResult {
  id: string;
  scenarioPrompt: string;
  verdictOnScenario: ScenarioVerdict;
  verdictRationale: string;
  revisedStrategySummary: string;
  potentialImpacts: {
    advantages: string[];
    newRisks: string[];
    leverageAssessment: string;
  };
  adjustedExecutionPlan: AdjustedSprintDay[];
  suggestedCapacityChange?: number;
  suggestedBudgetChange?: number;
  generatedAt: string;
  isDemoOrFallback?: boolean;
}

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  input: ProjectInput;
  strategy: StrategyAnalysis | null;
  sprintTasks: SprintTask[];
  evidenceLogs: EvidenceLog[];
  review: ReviewSynthesis | null;
  scenarios?: WhatIfScenarioResult[];
}

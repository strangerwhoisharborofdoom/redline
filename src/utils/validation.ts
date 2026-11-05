import { SprintTask, ProjectInput, StrategyAnalysis, ReviewSynthesis } from '../types';

export interface EffortValidationResult {
  isValid: boolean;
  totalEffortHours: number;
  capacityHours: number;
  remainingHours: number;
  overflowHours: number;
  dailyHours: Record<number, number>;
}

export function validateEffortBudget(
  tasks: SprintTask[],
  capacityHours: number
): EffortValidationResult {
  const safeCapacity = Math.max(1, capacityHours || 10);
  const dailyHours: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  };

  let total = 0;
  tasks.forEach((t) => {
    const hrs = typeof t.estimatedHours === 'number' && !isNaN(t.estimatedHours) ? t.estimatedHours : 0;
    total += hrs;
    const d = t.dayNumber >= 1 && t.dayNumber <= 7 ? t.dayNumber : 1;
    dailyHours[d] = (dailyHours[d] || 0) + hrs;
  });

  // Round to 1 decimal place to prevent floating-point anomalies
  total = Math.round(total * 10) / 10;
  const isValid = total <= safeCapacity;
  const remainingHours = Math.max(0, Math.round((safeCapacity - total) * 10) / 10);
  const overflowHours = Math.max(0, Math.round((total - safeCapacity) * 10) / 10);

  return {
    isValid,
    totalEffortHours: total,
    capacityHours: safeCapacity,
    remainingHours,
    overflowHours,
    dailyHours,
  };
}

/**
 * Ensures sprint task effort estimates strictly do not exceed capacity.
 * If total exceeds capacity, tasks are scaled down proportionally with minimum 0.5h.
 */
export function enforceEffortBudget(tasks: SprintTask[], capacityHours: number): SprintTask[] {
  const safeCapacity = Math.max(1, capacityHours || 10);
  const currentTotal = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  if (currentTotal <= safeCapacity && currentTotal > 0) {
    return tasks;
  }

  // If 0 total or exceeded, redistribute
  if (currentTotal === 0) {
    const perDay = Math.floor((safeCapacity / 7) * 10) / 10 || 1;
    return tasks.map((t) => ({ ...t, estimatedHours: perDay }));
  }

  const scaleFactor = safeCapacity / currentTotal;
  let runningSum = 0;

  const adjusted = tasks.map((t, idx) => {
    // If last task, take whatever remaining to perfectly equal or be below safeCapacity
    if (idx === tasks.length - 1) {
      const remaining = Math.max(0.5, Math.round((safeCapacity - runningSum) * 10) / 10);
      return { ...t, estimatedHours: remaining };
    }
    const scaled = Math.max(0.5, Math.round(t.estimatedHours * scaleFactor * 10) / 10);
    runningSum += scaled;
    return { ...t, estimatedHours: scaled };
  });

  return adjusted;
}

export function validateProjectInput(input: Partial<ProjectInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.idea || input.idea.trim().length < 10) {
    errors.idea = 'Please enter at least a brief description of what you are trying to build (minimum 10 characters).';
  }

  if (input.hoursPerWeek !== undefined && (input.hoursPerWeek <= 0 || input.hoursPerWeek > 100)) {
    errors.hoursPerWeek = 'Available hours must be between 1 and 100 hours per week.';
  }

  if (input.budgetAmount !== undefined && input.budgetAmount < 0) {
    errors.budgetAmount = 'Budget cannot be negative.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeAndValidateStrategy(
  raw: any,
  defaultCapacity: number = 14
): { strategy: StrategyAnalysis; sprintTasks: SprintTask[] } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI response was empty or not an object.');
  }

  // 1. Sanitize Strategy fields
  const customerAndProblem = {
    targetCustomer:
      typeof raw.customerAndProblem?.targetCustomer === 'string'
        ? raw.customerAndProblem.targetCustomer
        : 'Target customer unvalidated',
    specificProblem:
      typeof raw.customerAndProblem?.specificProblem === 'string'
        ? raw.customerAndProblem.specificProblem
        : 'Specific problem unvalidated',
    whyNowAndUrgency:
      typeof raw.customerAndProblem?.whyNowAndUrgency === 'string'
        ? raw.customerAndProblem.whyNowAndUrgency
        : 'Why now context unvalidated',
  };

  const riskiestAssumption =
    typeof raw.riskiestAssumption === 'string' && raw.riskiestAssumption.trim()
      ? raw.riskiestAssumption
      : 'Unvalidated assumption: Target customer has urgent willingness to solve this problem.';

  const rawUnvalidated = Array.isArray(raw.evidenceVsAssumption?.unvalidatedAssumptions)
    ? raw.evidenceVsAssumption.unvalidatedAssumptions.filter((x: any) => typeof x === 'string' && x.trim())
    : [];

  const evidenceVsAssumption = {
    knownEvidence: Array.isArray(raw.evidenceVsAssumption?.knownEvidence)
      ? raw.evidenceVsAssumption.knownEvidence.filter((x: any) => typeof x === 'string' && x.trim())
      : [],
    unvalidatedAssumptions:
      rawUnvalidated.length > 0
        ? rawUnvalidated
        : ['Unvalidated assumption: Target customer has urgent willingness to pay or adopt this solution.'],
  };

  const threeApproaches = Array.isArray(raw.threeApproaches) && raw.threeApproaches.length >= 2
    ? raw.threeApproaches.map((app: any, idx: number) => ({
        title: typeof app.title === 'string' ? app.title : `Approach ${idx + 1}`,
        pros: Array.isArray(app.pros) ? app.pros.map(String) : ['Faster initial start'],
        cons: Array.isArray(app.cons) ? app.cons.map(String) : ['Potential scope risk'],
        tradeoffs: typeof app.tradeoffs === 'string' ? app.tradeoffs : 'Requires careful scope management.',
        estimatedDaysToValidate: typeof app.estimatedDaysToValidate === 'number' ? app.estimatedDaysToValidate : 7,
      }))
    : [
        {
          title: 'Concierge Validation (No Code)',
          pros: ['Immediate customer feedback', 'Zero dev cost'],
          cons: ['Manual operational effort'],
          tradeoffs: 'Fastest proof of demand before writing code.',
          estimatedDaysToValidate: 4,
        },
        {
          title: 'Single-Feature Micro Prototype',
          pros: ['Direct software feedback', 'Reusable core logic'],
          cons: ['Requires focused development hours'],
          tradeoffs: 'Validates UX and workflow directly.',
          estimatedDaysToValidate: 7,
        },
        {
          title: 'Full Platform MVP',
          pros: ['Broadest feature set'],
          cons: ['High risk of wasted code', 'Exceeds sprint capacity'],
          tradeoffs: 'High risk of building unused features.',
          estimatedDaysToValidate: 30,
        },
      ];

  const recommendedApproach = {
    approachTitle:
      typeof raw.recommendedApproach?.approachTitle === 'string'
        ? raw.recommendedApproach.approachTitle
        : threeApproaches[1]?.title || threeApproaches[0]?.title || 'Single-Feature Micro Prototype',
    reasoning:
      typeof raw.recommendedApproach?.reasoning === 'string'
        ? raw.recommendedApproach.reasoning
        : 'Maximizes customer learning while strictly respecting solo founder constraints.',
    whyNotOthers:
      typeof raw.recommendedApproach?.whyNotOthers === 'string'
        ? raw.recommendedApproach.whyNotOthers
        : 'Alternative approaches either carry too high dev overhead or fail to test software feasibility.',
  };

  const narrowMvpScope = Array.isArray(raw.narrowMvpScope) && raw.narrowMvpScope.length > 0
    ? raw.narrowMvpScope.map(String)
    : [
        'Single core user flow end-to-end',
        'Basic input capture and output delivery',
        'Manual confirmation of value delivered',
      ];

  const doNotBuildYet = Array.isArray(raw.doNotBuildYet) && raw.doNotBuildYet.length > 0
    ? raw.doNotBuildYet.map(String)
    : [
        'Multi-user organizations & permissions',
        'Complex billing tier matrix',
        'Custom analytics dashboards',
        'Automated onboarding emails',
      ];

  const validationExperiment = {
    title:
      typeof raw.validationExperiment?.title === 'string'
        ? raw.validationExperiment.title
        : 'Direct customer problem test',
    description:
      typeof raw.validationExperiment?.description === 'string'
        ? raw.validationExperiment.description
        : 'Present solution workflow to 5 target users and record willingness to pay or commit time.',
    channel:
      typeof raw.validationExperiment?.channel === 'string'
        ? raw.validationExperiment.channel
        : 'Direct outreach / existing communities',
    estimatedCost:
      typeof raw.validationExperiment?.estimatedCost === 'string'
        ? raw.validationExperiment.estimatedCost
        : '0',
  };

  const successThreshold =
    typeof raw.successThreshold === 'string' && raw.successThreshold.trim()
      ? raw.successThreshold
      : 'At least 3 out of 10 qualified prospects confirm they would pay or commit time to use this.';

  const stopOrPivotCondition =
    typeof raw.stopOrPivotCondition === 'string' && raw.stopOrPivotCondition.trim()
      ? raw.stopOrPivotCondition
      : 'If fewer than 2 prospects express willingness to test, stop building and interview to find the real friction point.';

  // 2. Sprint tasks extraction & normalization
  let sprintTasks: SprintTask[] = [];
  if (Array.isArray(raw.sevenDaySprint) && raw.sevenDaySprint.length > 0) {
    sprintTasks = raw.sevenDaySprint.map((t: any, idx: number) => ({
      id: `task-d${t.dayNumber || idx + 1}-${Date.now()}-${idx}`,
      dayNumber: t.dayNumber >= 1 && t.dayNumber <= 7 ? t.dayNumber : idx + 1,
      title: typeof t.title === 'string' ? t.title : `Sprint Step Day ${idx + 1}`,
      description: typeof t.description === 'string' ? t.description : 'Execute validation activity.',
      estimatedHours: typeof t.estimatedHours === 'number' && !isNaN(t.estimatedHours) ? t.estimatedHours : 2,
      deliverable: typeof t.deliverable === 'string' ? t.deliverable : 'Documented progress and tangible artifact.',
      dependencies: Array.isArray(t.dependencies) ? t.dependencies.map(String) : idx > 0 ? [`Day ${idx}`] : ['None'],
      isCompleted: false,
    }));
  }

  // Ensure exactly 7 days represented if missing
  if (sprintTasks.length === 0) {
    const dailyHoursDefault = Math.round((defaultCapacity / 7) * 10) / 10;
    for (let day = 1; day <= 7; day++) {
      sprintTasks.push({
        id: `task-d${day}-${Date.now()}-${day}`,
        dayNumber: day,
        title: `Day ${day} Execution Task`,
        description: `Execute day ${day} deliverable toward validation threshold.`,
        estimatedHours: dailyHoursDefault,
        deliverable: `Day ${day} verified output artifact.`,
        dependencies: day > 1 ? [`Day ${day - 1}`] : ['None'],
        isCompleted: false,
      });
    }
  }

  // Enforce effort budget on extracted tasks
  sprintTasks = enforceEffortBudget(sprintTasks, defaultCapacity);

  const strategy: StrategyAnalysis = {
    customerAndProblem,
    riskiestAssumption,
    evidenceVsAssumption,
    threeApproaches,
    recommendedApproach,
    narrowMvpScope,
    doNotBuildYet,
    validationExperiment,
    successThreshold,
    stopOrPivotCondition,
    generatedAt: new Date().toISOString(),
    isDemoOrFallback: raw.isDemoOrFallback === true,
    modelIdentifier: raw.modelIdentifier || 'gemini-3.8-flash',
  };

  return { strategy, sprintTasks };
}

export function sanitizeAndValidateReview(raw: any): ReviewSynthesis {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Review synthesis response was invalid.');
  }

  const validVerdicts = ['CONTINUE', 'REVISE', 'STOP'] as const;
  let verdict = (typeof raw.verdict === 'string' ? raw.verdict.toUpperCase().trim() : 'REVISE') as any;
  if (!validVerdicts.includes(verdict)) {
    verdict = 'REVISE';
  }

  return {
    verdict,
    verdictSummary:
      typeof raw.verdictSummary === 'string' && raw.verdictSummary.trim()
        ? raw.verdictSummary
        : `Assessment indicates ${verdict.toLowerCase()} trajectory based on recorded field data.`,
    provenByEvidence: Array.isArray(raw.provenByEvidence)
      ? raw.provenByEvidence.filter((x: any) => typeof x === 'string' && x.trim())
      : [],
    unvalidatedAssumptions: Array.isArray(raw.unvalidatedAssumptions)
      ? raw.unvalidatedAssumptions.filter((x: any) => typeof x === 'string' && x.trim())
      : ['Core willingness to pay remains an unvalidated assumption.'],
    immediateNextStep:
      typeof raw.immediateNextStep === 'string' && raw.immediateNextStep.trim()
        ? raw.immediateNextStep
        : 'Interview 3 more prospects focusing strictly on previous purchase behavior.',
    detailedRationale:
      typeof raw.detailedRationale === 'string' && raw.detailedRationale.trim()
        ? raw.detailedRationale
        : 'Distinguishing proven observations from unvalidated founder assumptions.',
    generatedAt: new Date().toISOString(),
    isDemoOrFallback: raw.isDemoOrFallback === true,
  };
}

export function sanitizeAndValidateWhatIf(raw: any, scenarioPrompt: string): import('../types').WhatIfScenarioResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('What-If scenario response was invalid.');
  }

  const validVerdicts = ['WORTHWHILE_SHIFT', 'DISTRACTING_NOISE', 'NEUTRAL_TRADE'] as const;
  let verdictOnScenario = (
    typeof raw.verdictOnScenario === 'string'
      ? raw.verdictOnScenario.toUpperCase().trim()
      : 'NEUTRAL_TRADE'
  ) as any;
  if (!validVerdicts.includes(verdictOnScenario)) {
    verdictOnScenario = 'NEUTRAL_TRADE';
  }

  const potentialImpacts = {
    advantages: Array.isArray(raw.potentialImpacts?.advantages)
      ? raw.potentialImpacts.advantages.map(String)
      : ['Increased resource runway for sprint'],
    newRisks: Array.isArray(raw.potentialImpacts?.newRisks)
      ? raw.potentialImpacts.newRisks.map(String)
      : ['Scope creep risk if focus is not maintained'],
    leverageAssessment:
      typeof raw.potentialImpacts?.leverageAssessment === 'string'
        ? raw.potentialImpacts.leverageAssessment
        : 'Moderately affects validation velocity.',
  };

  const adjustedExecutionPlan = Array.isArray(raw.adjustedExecutionPlan) && raw.adjustedExecutionPlan.length > 0
    ? raw.adjustedExecutionPlan.map((d: any, idx: number) => ({
        dayNumber: d.dayNumber >= 1 && d.dayNumber <= 7 ? d.dayNumber : idx + 1,
        title: typeof d.title === 'string' ? d.title : `Adjusted Day ${idx + 1}`,
        estimatedHours: typeof d.estimatedHours === 'number' && !isNaN(d.estimatedHours) ? d.estimatedHours : 2,
        revisedDeliverable: typeof d.revisedDeliverable === 'string' ? d.revisedDeliverable : 'Revised deliverable',
        shiftFromOriginal: typeof d.shiftFromOriginal === 'string' ? d.shiftFromOriginal : 'Timeline adjusted',
      }))
    : [];

  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    scenarioPrompt: scenarioPrompt.trim(),
    verdictOnScenario,
    verdictRationale:
      typeof raw.verdictRationale === 'string'
        ? raw.verdictRationale
        : 'Evaluating hypothetical trade-off against core validation razor.',
    revisedStrategySummary:
      typeof raw.revisedStrategySummary === 'string'
        ? raw.revisedStrategySummary
        : 'Strategy adjusted to account for revised parameter assumptions.',
    potentialImpacts,
    adjustedExecutionPlan,
    suggestedCapacityChange: typeof raw.suggestedCapacityChange === 'number' ? raw.suggestedCapacityChange : undefined,
    suggestedBudgetChange: typeof raw.suggestedBudgetChange === 'number' ? raw.suggestedBudgetChange : undefined,
    generatedAt: new Date().toISOString(),
    isDemoOrFallback: raw.isDemoOrFallback === true,
  };
}

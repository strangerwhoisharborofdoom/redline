import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { sanitizeAndValidateStrategy, sanitizeAndValidateReview, enforceEffortBudget } from './src/utils/validation.ts';
import { ProjectInput, SprintTask } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI client (Server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!apiKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Helper for deterministic offline demo sprint when AI is unavailable or explicitly requested
function generateOfflineSprintFallback(input: ProjectInput, reason: string) {
  const capacity = input.hoursPerWeek || 14;
  const currencySymbol = input.budgetCurrency === 'INR' ? '₹' : '$';
  const hoursPerDay = Math.round((capacity / 7) * 10) / 10;

  const raw = {
    customerAndProblem: {
      targetCustomer: input.targetCustomer || 'Prospective niche buyers struggling with the stated pain point',
      specificProblem: `Manual, high-friction workflow around: "${input.idea.slice(0, 140)}..."`,
      whyNowAndUrgency: 'Existing alternatives are bloated or require expensive enterprise retainers.',
    },
    riskiestAssumption: 'Target customers will commit real budget or switch tools without custom enterprise integrations.',
    evidenceVsAssumption: {
      knownEvidence: [
        `Founder possesses core skill competencies: ${input.skills.join(', ') || 'General problem domain knowledge'}.`,
        `Committed budget constraint: ${currencySymbol} ${input.budgetAmount} with ${capacity} hours/week availability.`,
      ],
      unvalidatedAssumptions: [
        'Target customers acknowledge this is an acute, high-frequency bleeding problem.',
        'Customers will agree to pilot an unpolished MVP from a solo developer.',
        'Organic distribution channels can deliver qualified leads with zero ad spend.',
      ],
    },
    threeApproaches: [
      {
        title: 'Concierge Proof-of-Value (Manual Service)',
        pros: ['Fastest time to first customer', 'Zero upfront code debt'],
        cons: ['Does not test software leverage', 'High human hours'],
        tradeoffs: 'Sacrifices scalability for instant qualitative validation.',
        estimatedDaysToValidate: 4,
      },
      {
        title: 'Single-Feature Micro-Tool (Recommended)',
        pros: ['Directly tests software utility', 'Strictly fits within 7-day budget'],
        cons: ['Narrow scope excludes secondary requests'],
        tradeoffs: 'Builds strictly the single indispensable user loop.',
        estimatedDaysToValidate: 7,
      },
      {
        title: 'Comprehensive SaaS Platform',
        pros: ['Complete end-to-end vision'],
        cons: ['Massive over-engineering risk', 'Exceeds weekly hour limit by 300%'],
        tradeoffs: 'High risk of building things no one will ever use.',
        estimatedDaysToValidate: 45,
      },
    ],
    recommendedApproach: {
      approachTitle: 'Single-Feature Micro-Tool',
      reasoning: `Aligns directly with your ${capacity} hours/week bandwidth while producing a tangible, testable software deliverable.`,
      whyNotOthers: 'Full platform will lead to burnout before validation, while pure concierge cannot prove automated utility.',
    },
    narrowMvpScope: [
      'One input trigger (file upload, form, or webhook)',
      'One automated core transformation/action',
      'One direct deliverable/result returned to user',
    ],
    doNotBuildYet: [
      'Multi-tenant team management or RBAC',
      'Custom billing tiers or coupon engine',
      'Complex analytic dashboards and reporting',
      'Automated drip marketing campaigns',
    ],
    validationExperiment: {
      title: '5 Customer Problem-Smoke Test',
      description: 'Contact 10 targeted prospective users in niche communities; pitch the specific one-step outcome and request a commitment to test.',
      channel: 'Direct cold outreach (LinkedIn, niche Slack/Discord communities, or direct email).',
      estimatedCost: `${currencySymbol} 0 - ${currencySymbol} ${Math.min(input.budgetAmount, 1000)}`,
    },
    successThreshold: 'At least 3 out of 10 contacted prospects agree to an interactive demo or share test data.',
    stopOrPivotCondition: 'If fewer than 2 prospects express willingness to test after 15 targeted contacts, halt code development and pivot problem angle.',
    sevenDaySprint: [
      {
        dayNumber: 1,
        title: 'Prospect List & Direct Pitch Script',
        description: 'Identify and qualify 20 exact prospective users matching target customer profile.',
        estimatedHours: Math.min(2, hoursPerDay),
        deliverable: 'Spreadsheet of 20 named prospects with active contact channels.',
        dependencies: ['None'],
      },
      {
        dayNumber: 2,
        title: 'Initial Outreach & Discovery Interviews',
        description: 'Send 15 personalized direct messages; schedule or conduct 3 discovery discussions.',
        estimatedHours: Math.min(2, hoursPerDay),
        deliverable: 'At least 3 written interview notes detailing current workflow pain.',
        dependencies: ['Day 1'],
      },
      {
        dayNumber: 3,
        title: 'Core Single-Action Prototype Spike',
        description: 'Build only the single data-transform or action script that solves the core bottleneck.',
        estimatedHours: hoursPerDay,
        deliverable: 'Functional core script demonstrated locally with sample data.',
        dependencies: ['Day 2'],
      },
      {
        dayNumber: 4,
        title: 'Minimal Frontend / UI Wrapper',
        description: 'Create clean, bare-minimum interface allowing user to trigger the action.',
        estimatedHours: hoursPerDay,
        deliverable: 'Deployed test URL or shareable screen recording.',
        dependencies: ['Day 3'],
      },
      {
        dayNumber: 5,
        title: 'Live Pilot Session with Prospect #1',
        description: 'Walk through prototype with first interested prospect using real customer data.',
        estimatedHours: Math.min(2, hoursPerDay),
        deliverable: 'Documented friction points and direct customer reaction.',
        dependencies: ['Day 4'],
      },
      {
        dayNumber: 6,
        title: 'Run 2 Additional Pilot Demonstrations',
        description: 'Test with 2 more prospects; note whether they request immediate ongoing access.',
        estimatedHours: hoursPerDay,
        deliverable: '3 total pilot test results recorded in Evidence Log.',
        dependencies: ['Day 5'],
      },
      {
        dayNumber: 7,
        title: 'Validation Synthesis & Go/No-Go Decision',
        description: 'Compare collected pilot feedback against success threshold; decide Continue, Revise, or Stop.',
        estimatedHours: Math.min(1.5, hoursPerDay),
        deliverable: 'Documented Redline review verdict with concrete next steps.',
        dependencies: ['Day 6'],
      },
    ],
    isDemoOrFallback: true,
    modelIdentifier: 'demo-fallback-offline',
  };

  return sanitizeAndValidateStrategy(raw, capacity);
}

// 1. Analyze Endpoint: Turns messy idea into Redline strategy & 7-day sprint
app.post('/api/analyze', async (req, res) => {
  try {
    const { input, forceDemoMode } = req.body;
    if (!input || !input.idea) {
      return res.status(400).json({ error: 'Missing required project input.' });
    }

    const capacityHours = Number(input.hoursPerWeek) || 14;

    // Check if offline fallback is requested or API key is absent
    if (forceDemoMode || !aiClient || !apiKey) {
      const fallbackReason = !apiKey
        ? 'No GEMINI_API_KEY detected in environment. Running in verified offline Demo Mode.'
        : 'Demo mode explicitly requested.';
      const result = generateOfflineSprintFallback(input, fallbackReason);
      return res.json({
        ...result,
        isDemoOrFallback: true,
        fallbackReason,
        modelIdentifier: 'demo-fallback-offline',
      });
    }

    // Call Gemini with structured response schema
    const prompt = `You are REDLINE, a ruthless validation strategist and execution copilot for solo founders and developers.
Your motto: "Cut through noise. Ship what matters."
Turn the following founder input into a laser-focused, realistic 7-day validation sprint.
DO NOT write generic business essays.
DO NOT invent fabricated statistics, fake user quotes, or fake market research numbers.
If the founder provided no empirical evidence, classify all claims as "unvalidated assumptions".
DO NOT output arbitrary numerical confidence scores.

STRICT CONSTRAINTS:
1. The 7-day sprint MUST have total estimated effort <= ${capacityHours} hours. (Founder capacity: ${capacityHours} hrs/week).
2. Distinguish known evidence provided by the founder from unvalidated assumptions.
3. Provide 3 distinct approaches with brutal tradeoffs, and recommend the one best suited for a solo builder with these constraints.
4. Provide a deliberately narrow MVP scope and a clear "Do not build yet" redline list.
5. Create a 7-day execution plan where each day has concrete tasks, realistic estimated hours, specific deliverables, and dependencies.

<user_input_data>
Title: ${input.title || 'Untitled'}
Idea: ${input.idea}
Target Customer: ${input.targetCustomer || 'Unspecified'}
Weekly Available Hours: ${capacityHours} hrs/week
Budget: ${input.budgetAmount} ${input.budgetCurrency}
Founder Skills: ${Array.isArray(input.skills) ? input.skills.join(', ') : 'Not specified'}
Biggest Constraint: ${input.biggestConstraint || 'None stated'}
</user_input_data>

Produce the structured validation sprint matching the requested JSON schema.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Redline, an expert lean validation engine for solo developers. You prioritize speed of truth over vanity features. Never hallucinate research citations. Output strictly conforming JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerAndProblem: {
              type: Type.OBJECT,
              properties: {
                targetCustomer: { type: Type.STRING },
                specificProblem: { type: Type.STRING },
                whyNowAndUrgency: { type: Type.STRING },
              },
              required: ['targetCustomer', 'specificProblem', 'whyNowAndUrgency'],
            },
            riskiestAssumption: { type: Type.STRING },
            evidenceVsAssumption: {
              type: Type.OBJECT,
              properties: {
                knownEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                unvalidatedAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['knownEvidence', 'unvalidatedAssumptions'],
            },
            threeApproaches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tradeoffs: { type: Type.STRING },
                  estimatedDaysToValidate: { type: Type.INTEGER },
                },
                required: ['title', 'pros', 'cons', 'tradeoffs', 'estimatedDaysToValidate'],
              },
            },
            recommendedApproach: {
              type: Type.OBJECT,
              properties: {
                approachTitle: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                whyNotOthers: { type: Type.STRING },
              },
              required: ['approachTitle', 'reasoning', 'whyNotOthers'],
            },
            narrowMvpScope: { type: Type.ARRAY, items: { type: Type.STRING } },
            doNotBuildYet: { type: Type.ARRAY, items: { type: Type.STRING } },
            validationExperiment: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                channel: { type: Type.STRING },
                estimatedCost: { type: Type.STRING },
              },
              required: ['title', 'description', 'channel', 'estimatedCost'],
            },
            successThreshold: { type: Type.STRING },
            stopOrPivotCondition: { type: Type.STRING },
            sevenDaySprint: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedHours: { type: Type.NUMBER },
                  deliverable: { type: Type.STRING },
                  dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['dayNumber', 'title', 'description', 'estimatedHours', 'deliverable', 'dependencies'],
              },
            },
          },
          required: [
            'customerAndProblem',
            'riskiestAssumption',
            'evidenceVsAssumption',
            'threeApproaches',
            'recommendedApproach',
            'narrowMvpScope',
            'doNotBuildYet',
            'validationExperiment',
            'successThreshold',
            'stopOrPivotCondition',
            'sevenDaySprint',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty text response.');
    }

    const rawJson = JSON.parse(text);
    const { strategy, sprintTasks } = sanitizeAndValidateStrategy(rawJson, capacityHours);

    res.json({
      strategy,
      sprintTasks,
      isDemoOrFallback: false,
      modelIdentifier: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    // If Gemini call fails, provide clearly labelled fallback so app remains functional
    const fallback = generateOfflineSprintFallback(req.body.input, `AI service encountered an error: ${error.message || 'Call failed'}`);
    res.json({
      ...fallback,
      isDemoOrFallback: true,
      fallbackReason: `Real AI call failed (${error.message || 'Error'}). Provided fallback validation sprint.`,
      modelIdentifier: 'demo-fallback-offline',
    });
  }
});

// 2. Synthesize Review Endpoint: Evaluates recorded evidence against success gates
app.post('/api/synthesize-review', async (req, res) => {
  try {
    const { strategy, evidenceLogs, sprintTasks, forceDemoMode } = req.body;
    if (!strategy) {
      return res.status(400).json({ error: 'Missing strategy data for review synthesis.' });
    }

    const logs = Array.isArray(evidenceLogs) ? evidenceLogs : [];
    const completedTasks = Array.isArray(sprintTasks) ? sprintTasks.filter((t: SprintTask) => t.isCompleted) : [];

    if (forceDemoMode || !aiClient || !apiKey) {
      const hasValidated = logs.some((l: any) => l.status === 'Validated');
      const hasInvalidated = logs.some((l: any) => l.status === 'Invalidated');
      let fallbackVerdict: 'CONTINUE' | 'REVISE' | 'STOP' = 'REVISE';
      if (hasValidated && !hasInvalidated) fallbackVerdict = 'CONTINUE';
      if (hasInvalidated && !hasValidated) fallbackVerdict = 'STOP';

      const fallback = {
        verdict: fallbackVerdict,
        verdictSummary: `Offline assessment: ${logs.length} evidence items recorded with ${completedTasks.length} sprint deliverables completed.`,
        provenByEvidence: logs
          .filter((l: any) => l.status === 'Validated')
          .map((l: any) => `[${l.source}]: ${l.observation}`),
        unvalidatedAssumptions: [
          strategy.riskiestAssumption || 'Core customer willingness to pay remains unvalidated.',
          'Sustained retention over 30 days is unproven.',
        ],
        immediateNextStep:
          fallbackVerdict === 'STOP'
            ? 'Halt code development immediately; conduct 5 problem discovery interviews to pivot.'
            : 'Execute next sprint task and verify measurable payment threshold.',
        detailedRationale:
          'Evaluated recorded field observations against the success threshold and stop condition. Direct customer evidence was given priority over speculative assumptions.',
        generatedAt: new Date().toISOString(),
        isDemoOrFallback: true,
      };

      return res.json(sanitizeAndValidateReview(fallback));
    }

    const prompt = `You are REDLINE, the ruthless validation auditor.
Evaluate the founder's validation progress against their strategic gates.

<strategy_context>
Target Customer: ${strategy.customerAndProblem?.targetCustomer}
Problem: ${strategy.customerAndProblem?.specificProblem}
Riskiest Assumption: ${strategy.riskiestAssumption}
Validation Experiment: ${strategy.validationExperiment?.title} - ${strategy.validationExperiment?.description}
Success Threshold: ${strategy.successThreshold}
Stop / Pivot Condition: ${strategy.stopOrPivotCondition}
</strategy_context>

<completed_tasks>
Total tasks completed: ${completedTasks.length} of ${Array.isArray(sprintTasks) ? sprintTasks.length : 0}
${completedTasks.map((t: any) => `- Day ${t.dayNumber}: ${t.title} -> Deliverable: ${t.deliverable} (Notes: ${t.notes || 'None'})`).join('\n')}
</completed_tasks>

<recorded_evidence_logs>
${
  logs.length > 0
    ? logs
        .map(
          (l: any) =>
            `- Date: ${l.date} | Source: ${l.source} | Status: ${l.status}\n  Observation: ${l.observation}${l.notes ? `\n  Notes: ${l.notes}` : ''}`
        )
        .join('\n')
    : 'No evidence logs recorded yet.'
}
</recorded_evidence_logs>

RULES:
1. Issue one explicit Verdict: "CONTINUE", "REVISE", or "STOP".
2. Under "provenByEvidence", list ONLY facts directly supported by the recorded logs or task deliverables. Do NOT infer or imagine facts.
3. Under "unvalidatedAssumptions", list remaining critical unknowns that the founder has NOT yet proven.
4. Give an actionable, single immediate next step.
5. Provide detailed rationale distinguishing verified customer proof from founder hope.
Do NOT fabricate numbers or claims.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Redline. Be direct, honest, and rigorous. Never sugarcoat bad news. Never substitute speculation for evidence. Output JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: 'Must be CONTINUE, REVISE, or STOP' },
            verdictSummary: { type: Type.STRING },
            provenByEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
            unvalidatedAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            immediateNextStep: { type: Type.STRING },
            detailedRationale: { type: Type.STRING },
          },
          required: [
            'verdict',
            'verdictSummary',
            'provenByEvidence',
            'unvalidatedAssumptions',
            'immediateNextStep',
            'detailedRationale',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty review response.');
    }

    const review = sanitizeAndValidateReview(JSON.parse(text));
    res.json(review);
  } catch (error: any) {
    console.error('Error in /api/synthesize-review:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize review' });
  }
});

// Helper for offline What-If fallback
function generateOfflineWhatIfFallback(currentProject: any, scenarioPrompt: string, reason: string) {
  const currentHours = currentProject.input?.hoursPerWeek || 14;
  const isHoursChange = /hour|time|bandwidth|capacity/i.test(scenarioPrompt);
  const isBudgetChange = /budget|money|cash|fund|inr|dollar/i.test(scenarioPrompt);

  let newCapacity = currentHours;
  if (isHoursChange) {
    const match = scenarioPrompt.match(/(\d+)\s*(?:hours?|hrs?)/i);
    if (match) newCapacity = parseInt(match[1], 10);
    else newCapacity = currentHours + 6;
  }

  const raw = {
    verdictOnScenario: isHoursChange ? 'WORTHWHILE_SHIFT' : 'NEUTRAL_TRADE',
    verdictRationale: `Offline heuristic: "${scenarioPrompt}" gives more operational room, but speed of customer contact remains the only true validator. More time or budget without direct conversations merely extends the illusion of progress.`,
    revisedStrategySummary: `Adapt validation scope to exploit "${scenarioPrompt}". Reallocate extra capacity directly into additional prospect interviews and faster feedback loops rather than building non-essential architecture.`,
    potentialImpacts: {
      advantages: [
        'Higher interview volume possible in the first 72 hours',
        'Reduces cognitive fatigue during prototype assembly',
        'Allows running concurrent outreach channels',
      ],
      newRisks: [
        'Risk of gold-plating the MVP before proving payment intent',
        'Temptation to build secondary settings and admin features prematurely',
      ],
      leverageAssessment: 'High leverage if extra capacity is channeled into distribution; zero leverage if spent writing backend code.',
    },
    suggestedCapacityChange: isHoursChange ? newCapacity : undefined,
    adjustedExecutionPlan: [
      {
        dayNumber: 1,
        title: 'Accelerated Prospect Pipeline',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: 'Expanded list of 40 qualified prospects with direct channels.',
        shiftFromOriginal: 'Doubles target outreach list size.',
      },
      {
        dayNumber: 2,
        title: 'Dual-Channel Cold Outreach',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: 'At least 5 scheduled discovery discussions.',
        shiftFromOriginal: 'Conducts 2 extra discovery calls.',
      },
      {
        dayNumber: 3,
        title: 'Core Prototype with Test Instrumentation',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: 'Working core script with simple analytics event logging.',
        shiftFromOriginal: 'Adds lightweight telemetry to measure friction.',
      },
      {
        dayNumber: 4,
        title: 'Interactive Shareable Demo',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: 'Hosted test URL or dynamic Loom demonstration link.',
        shiftFromOriginal: 'Higher fidelity demo delivered to prospects.',
      },
      {
        dayNumber: 5,
        title: 'Consecutive Live Pilot Sessions',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: '3 live walk-throughs completed with prospect data.',
        shiftFromOriginal: 'Increases pilot sample from 1 to 3 users.',
      },
      {
        dayNumber: 6,
        title: 'Objection Handling & Secondary Test Batch',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: 'Documented objections and revised pricing pitch.',
        shiftFromOriginal: 'Deeper qualitative pattern synthesis.',
      },
      {
        dayNumber: 7,
        title: 'Retrospective & Advance Deposit Offer',
        estimatedHours: Math.round((newCapacity / 7) * 10) / 10,
        revisedDeliverable: 'Formal Go/No-Go decision based on pilot conversion.',
        shiftFromOriginal: 'Definitive commercial validation gate.',
      },
    ],
    isDemoOrFallback: true,
  };

  return {
    ...raw,
    id: `scenario-${Date.now()}`,
    scenarioPrompt,
    generatedAt: new Date().toISOString(),
  };
}

// 3. What-If Scenario Endpoint: Analyzes hypothetical parameter shifts
app.post('/api/what-if', async (req, res) => {
  try {
    const { currentProject, scenarioPrompt, forceDemoMode } = req.body;
    if (!currentProject || !scenarioPrompt) {
      return res.status(400).json({ error: 'Missing required project or scenario prompt.' });
    }

    if (forceDemoMode || !aiClient || !apiKey) {
      const fallbackReason = !apiKey
        ? 'No GEMINI_API_KEY detected. Running What-If in offline demo mode.'
        : 'Demo mode explicitly requested.';
      const fallback = generateOfflineWhatIfFallback(currentProject, scenarioPrompt, fallbackReason);
      return res.json(fallback);
    }

    const prompt = `You are REDLINE, the ruthless validation strategist.
The founder is testing a hypothetical scenario or parameter change on their sprint:
"${scenarioPrompt}"

<current_project_context>
Title: ${currentProject.input?.title}
Idea: ${currentProject.input?.idea}
Target Customer: ${currentProject.input?.targetCustomer}
Weekly Hours: ${currentProject.input?.hoursPerWeek} hrs/week
Budget: ${currentProject.input?.budgetAmount} ${currentProject.input?.budgetCurrency}
Constraint: ${currentProject.input?.biggestConstraint}
Current Riskiest Assumption: ${currentProject.strategy?.riskiestAssumption}
Current Recommended Approach: ${currentProject.strategy?.recommendedApproach?.approachTitle}
</current_project_context>

ANALYZE WITH BRUTAL REALISM:
1. Is this hypothetical a WORTHWHILE_SHIFT, DISTRACTING_NOISE, or NEUTRAL_TRADE?
2. Explain the rationale: does it actually accelerate customer truth, or does it merely feed the temptation to build more unneeded software?
3. Provide a revised strategy summary.
4. List potential advantages, new risks (e.g. scope creep, distraction), and an overall leverage assessment.
5. Provide an adjusted 7-day execution plan showing dayNumber, title, estimatedHours, revisedDeliverable, and shiftFromOriginal.
6. If the scenario implies a capacity change (e.g. "What if I had 25 hours?"), suggest the new capacity number.

Output strict JSON conforming to schema.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Redline. Be ruthless about cutting waste. More time or budget often leads to over-engineering unless directed strictly at customer contact. Output strictly valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdictOnScenario: {
              type: Type.STRING,
              description: 'Must be WORTHWHILE_SHIFT, DISTRACTING_NOISE, or NEUTRAL_TRADE',
            },
            verdictRationale: { type: Type.STRING },
            revisedStrategySummary: { type: Type.STRING },
            potentialImpacts: {
              type: Type.OBJECT,
              properties: {
                advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
                newRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                leverageAssessment: { type: Type.STRING },
              },
              required: ['advantages', 'newRisks', 'leverageAssessment'],
            },
            adjustedExecutionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  estimatedHours: { type: Type.NUMBER },
                  revisedDeliverable: { type: Type.STRING },
                  shiftFromOriginal: { type: Type.STRING },
                },
                required: ['dayNumber', 'title', 'estimatedHours', 'revisedDeliverable', 'shiftFromOriginal'],
              },
            },
            suggestedCapacityChange: { type: Type.NUMBER },
            suggestedBudgetChange: { type: Type.NUMBER },
          },
          required: [
            'verdictOnScenario',
            'verdictRationale',
            'revisedStrategySummary',
            'potentialImpacts',
            'adjustedExecutionPlan',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned empty text for scenario analysis.');
    }

    const parsed = JSON.parse(text);
    res.json({
      ...parsed,
      id: `scenario-${Date.now()}`,
      scenarioPrompt,
      generatedAt: new Date().toISOString(),
      isDemoOrFallback: false,
    });
  } catch (error: any) {
    console.error('Error in /api/what-if:', error);
    const fallback = generateOfflineWhatIfFallback(
      req.body.currentProject,
      req.body.scenarioPrompt,
      error.message
    );
    res.json(fallback);
  }
});

// Vite or Static assets integration
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Redline Server] Running on http://0.0.0.0:${PORT}`);
});

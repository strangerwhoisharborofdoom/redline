import { Project } from '../types';

export function formatProjectMarkdown(project: Project): string {
  const { input, strategy, sprintTasks, evidenceLogs, review } = project;
  const currencySymbol = input.budgetCurrency === 'INR' ? '₹' : '$';

  let md = `# ${input.title || 'Untitled Project'}\n`;
  md += `*Redline — Cut through noise. Ship what matters.*\n\n`;
  md += `**Date:** ${new Date(project.updatedAt).toLocaleDateString()}\n`;
  md += `**Target Customer:** ${input.targetCustomer || 'Unspecified'}\n`;
  md += `**Weekly Capacity:** ${input.hoursPerWeek} hrs/week\n`;
  md += `**Budget:** ${currencySymbol} ${input.budgetAmount} (${input.budgetCurrency})\n`;
  md += `**Core Skills:** ${input.skills.join(', ') || 'Not specified'}\n`;
  md += `**Constraint:** ${input.biggestConstraint || 'None stated'}\n\n`;

  md += `## 1. Raw Problem Idea\n`;
  md += `${input.idea}\n\n`;

  if (strategy) {
    md += `## 2. Redline Strategy & Problem Anatomy\n\n`;
    md += `### Target Customer & Problem\n`;
    md += `- **Target Customer:** ${strategy.customerAndProblem.targetCustomer}\n`;
    md += `- **Specific Problem:** ${strategy.customerAndProblem.specificProblem}\n`;
    md += `- **Urgency & Why Now:** ${strategy.customerAndProblem.whyNowAndUrgency}\n\n`;

    md += `### Riskiest Assumption (Failure Point)\n`;
    md += `> ${strategy.riskiestAssumption}\n\n`;

    md += `### Evidence vs. Assumption Separation\n`;
    md += `**Known Evidence:**\n`;
    if (strategy.evidenceVsAssumption.knownEvidence.length > 0) {
      strategy.evidenceVsAssumption.knownEvidence.forEach((item) => {
        md += `- ${item}\n`;
      });
    } else {
      md += `*None provided by user. All claims treated as unvalidated assumptions.*\n`;
    }
    md += `\n**Unvalidated Assumptions:**\n`;
    strategy.evidenceVsAssumption.unvalidatedAssumptions.forEach((item) => {
      md += `- ⚠️ ${item}\n`;
    });
    md += `\n`;

    md += `### Evaluated Approaches & Tradeoffs\n`;
    strategy.threeApproaches.forEach((app, idx) => {
      const isRec =
        strategy.recommendedApproach.approachTitle.toLowerCase() === app.title.toLowerCase();
      md += `#### Approach ${idx + 1}: ${app.title} ${isRec ? '*(RECOMMENDED)*' : ''}\n`;
      md += `- **Estimated Days to Validate:** ${app.estimatedDaysToValidate} days\n`;
      md += `- **Pros:** ${app.pros.join(', ')}\n`;
      md += `- **Cons:** ${app.cons.join(', ')}\n`;
      md += `- **Tradeoffs:** ${app.tradeoffs}\n\n`;
    });

    md += `### Recommended Path\n`;
    md += `**${strategy.recommendedApproach.approachTitle}**\n`;
    md += `- **Reasoning:** ${strategy.recommendedApproach.reasoning}\n`;
    md += `- **Why Other Paths Rejected:** ${strategy.recommendedApproach.whyNotOthers}\n\n`;

    md += `### Deliberately Narrow MVP Scope\n`;
    strategy.narrowMvpScope.forEach((scope) => {
      md += `- [ ] ${scope}\n`;
    });
    md += `\n`;

    md += `### Do NOT Build Yet (Redlined Waste)\n`;
    strategy.doNotBuildYet.forEach((item) => {
      md += `- 🚫 ${item}\n`;
    });
    md += `\n`;

    md += `### Inexpensive Validation Experiment\n`;
    md += `- **Experiment:** ${strategy.validationExperiment.title}\n`;
    md += `- **Channel:** ${strategy.validationExperiment.channel}\n`;
    md += `- **Estimated Cost:** ${strategy.validationExperiment.estimatedCost}\n`;
    md += `- **Description:** ${strategy.validationExperiment.description}\n\n`;

    md += `### Measurable Gates\n`;
    md += `- **Success Threshold:** ${strategy.successThreshold}\n`;
    md += `- **Stop / Pivot Condition:** ${strategy.stopOrPivotCondition}\n\n`;
  }

  md += `## 3. Seven-Day Validation Sprint Plan\n\n`;
  const totalEffort = sprintTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  md += `*Total Sprint Effort:* **${totalEffort} hours** (Available capacity: **${input.hoursPerWeek} hours**)\n\n`;

  const daysGrouped: Record<number, typeof sprintTasks> = {};
  for (let i = 1; i <= 7; i++) daysGrouped[i] = [];
  sprintTasks.forEach((t) => {
    if (!daysGrouped[t.dayNumber]) daysGrouped[t.dayNumber] = [];
    daysGrouped[t.dayNumber].push(t);
  });

  for (let day = 1; day <= 7; day++) {
    const tasks = daysGrouped[day] || [];
    md += `### Day ${day}\n`;
    if (tasks.length === 0) {
      md += `*Rest or overflow buffer day.*\n\n`;
      continue;
    }
    tasks.forEach((task) => {
      const check = task.isCompleted ? '[x]' : '[ ]';
      md += `- ${check} **${task.title}** (${task.estimatedHours}h)\n`;
      md += `  - *Action:* ${task.description}\n`;
      md += `  - *Deliverable:* ${task.deliverable}\n`;
      if (task.dependencies && task.dependencies.length > 0 && task.dependencies[0] !== 'None') {
        md += `  - *Dependencies:* ${task.dependencies.join(', ')}\n`;
      }
      if (task.notes) {
        md += `  - *Founder Note:* ${task.notes}\n`;
      }
    });
    md += `\n`;
  }

  md += `## 4. Evidence Log\n\n`;
  if (evidenceLogs.length === 0) {
    md += `*No field evidence recorded yet.*\n\n`;
  } else {
    evidenceLogs.forEach((ev) => {
      md += `### [${ev.date}] ${ev.source} — **${ev.status.toUpperCase()}**\n`;
      md += `${ev.observation}\n`;
      if (ev.notes) md += `*Note:* ${ev.notes}\n`;
      md += `\n`;
    });
  }

  if (review) {
    md += `## 5. Review & Verdict\n\n`;
    md += `**Verdict:** **${review.verdict}**\n`;
    md += `*Summary:* ${review.verdictSummary}\n\n`;
    md += `### Proven by Direct Evidence\n`;
    if (review.provenByEvidence.length > 0) {
      review.provenByEvidence.forEach((p) => {
        md += `- ✅ ${p}\n`;
      });
    } else {
      md += `*No conclusive empirical proof recorded yet.*\n`;
    }
    md += `\n### Unvalidated Assumptions Remaining\n`;
    review.unvalidatedAssumptions.forEach((u) => {
      md += `- ⚠️ ${u}\n`;
    });
    md += `\n### Immediate Next Step\n`;
    md += `> ${review.immediateNextStep}\n\n`;
    md += `### Detailed Rationale\n`;
    md += `${review.detailedRationale}\n\n`;
  }

  md += `---\n*Generated by Redline. Cut through noise. Ship what matters.*`;
  return md;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportProjectAsMarkdown(project: Project) {
  const md = formatProjectMarkdown(project);
  const sanitized = (project.input.title || 'redline-sprint')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = `${sanitized}-redline-${new Date().toISOString().slice(0, 10)}.md`;
  downloadFile(md, filename, 'text/markdown;charset=utf-8');
}

export function exportProjectAsJson(project: Project) {
  const jsonStr = JSON.stringify(project, null, 2);
  const sanitized = (project.input.title || 'redline-sprint')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = `${sanitized}-redline-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(jsonStr, filename, 'application/json;charset=utf-8');
}

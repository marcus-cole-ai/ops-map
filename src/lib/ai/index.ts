import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CompanyProfile, Workflow, Phase, Step, Function, SubFunction, CoreActivity } from "@/types";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Model configurations
export const MODELS = {
  "gemini-flash": {
    name: "Gemini 2.0 Flash",
    modelId: "gemini-2.0-flash",
    provider: "google",
  },
  "kimi-2.5": {
    name: "Kimi 2.5",
    modelId: "kimi-2.5",
    provider: "nvidia",
    disabled: true, // Not yet implemented
  },
} as const;

export type ModelId = keyof typeof MODELS;

// System prompt for construction industry consultant
export function getSystemPrompt(companyProfile?: CompanyProfile | null): string {
  const basePrompt = `You are an expert construction industry operations consultant with deep knowledge of:
- Residential and commercial construction operations
- Design-build, general contracting, and specialty trade workflows
- Construction project management best practices
- Client journey optimization for contractors
- Organizational structure and role definitions
- Industry software and technology solutions
- Process improvement and operational efficiency

Your role is to help construction companies optimize their operations by:
1. Analyzing their current processes and workflows
2. Identifying gaps and inefficiencies
3. Recommending industry best practices
4. Creating clear, actionable documentation

Always provide specific, practical recommendations tailored to the construction industry.
Use construction industry terminology appropriately.
Consider typical pain points: lead management, estimating accuracy, change orders, subcontractor coordination, project scheduling, client communication, and financial tracking.`;

  if (companyProfile && (companyProfile.industry || companyProfile.companyType)) {
    const profileContext = `

COMPANY CONTEXT:
${companyProfile.industry ? `- Industry: ${companyProfile.industry}` : ""}
${companyProfile.companyType ? `- Company Type: ${companyProfile.companyType}` : ""}
${companyProfile.size ? `- Team Size: ${companyProfile.size}` : ""}
${companyProfile.annualRevenue ? `- Annual Revenue: ${companyProfile.annualRevenue}` : ""}
${companyProfile.targetMargin ? `- Target Profit Margin: ${companyProfile.targetMargin}%` : ""}
${companyProfile.idealProject ? `- Ideal Project: ${companyProfile.idealProject}` : ""}
${companyProfile.serviceArea ? `- Service Area: ${companyProfile.serviceArea}` : ""}
${companyProfile.specialties?.length ? `- Specialties: ${companyProfile.specialties.join(", ")}` : ""}
${companyProfile.challenges ? `- Current Challenges: ${companyProfile.challenges}` : ""}

Tailor all recommendations specifically for this type of company.`;
    return basePrompt + profileContext;
  }

  return basePrompt;
}

// OpsMap data model context for AI
export function getDataModelContext(): string {
  return `
OPSMAP DATA MODEL:
OpsMap organizes construction company operations using these interconnected structures:

1. FUNCTION CHART (Organizational Structure):
   - Functions: Top-level business areas (e.g., Sales, Production, Finance)
   - Sub-Functions: Specific areas within functions (e.g., Lead Qualification, Estimating)
   - Core Activities: Actual tasks/processes (e.g., "Schedule discovery call", "Build estimate")
   - Activities can be assigned to Roles and People

2. WORKFLOWS (Process Documentation):
   - Workflows: Named processes (e.g., "Client Journey", "Sales Process")
   - Phases: Major stages within a workflow (e.g., "Lead", "Discovery", "Proposal")
   - Steps: Specific actions within phases (e.g., "Capture lead info", "Send intro email")
   - Steps can link to Core Activities for execution details

3. RESOURCES:
   - People: Team members with names, emails, roles
   - Roles: Job functions (e.g., "Project Manager", "Estimator")
   - Software: Tools used (e.g., "BuilderTrend", "QuickBooks")

When generating content:
- Create logical hierarchies that match this structure
- Use clear, action-oriented naming
- Ensure cross-references between workflows and function chart
- Include typical construction industry patterns`;
}

// Type definitions for AI responses
export interface GeneratedWorkflow {
  name: string;
  description: string;
  phases: {
    name: string;
    steps: string[];
  }[];
}

export interface GeneratedFunctionChart {
  functions: {
    name: string;
    description: string;
    color: string;
    subFunctions: {
      name: string;
      activities: string[];
    }[];
  }[];
}

export interface GeneratedGap {
  title: string;
  description: string;
  category: "workflow" | "function-chart" | "activity" | "general";
  priority: "critical" | "important" | "nice-to-have";
  recommendation: string;
  suggestedAction?: {
    type: "add-workflow" | "add-phase" | "add-step" | "add-function" | "add-activity";
    data: Record<string, unknown>;
  };
}

// Generate workflows from transcript
export async function generateWorkflowsFromTranscript(
  transcript: string,
  companyProfile?: CompanyProfile | null,
  modelId: ModelId = "gemini-flash"
): Promise<GeneratedWorkflow[]> {
  const model = genAI.getGenerativeModel({ model: MODELS[modelId].modelId });

  const prompt = `${getSystemPrompt(companyProfile)}

${getDataModelContext()}

TASK: Analyze the following transcript/brain dump and generate comprehensive workflows for this construction company.

TRANSCRIPT:
"""
${transcript}
"""

Generate workflows that capture:
1. A "Client Journey" workflow showing the complete customer experience from first contact to project completion and beyond
2. Additional phase-specific or process-specific workflows for any complex areas mentioned (e.g., "Sales Process", "Project Production", "Change Order Process")
3. Special attention to any challenging areas or pain points mentioned in the transcript

For each workflow, provide:
- Clear, descriptive name
- Brief description of the workflow's purpose
- Phases with logical progression
- Specific, actionable steps within each phase

Respond with ONLY valid JSON in this format (no markdown, no explanation):
{
  "workflows": [
    {
      "name": "Workflow Name",
      "description": "Brief description",
      "phases": [
        {
          "name": "Phase Name",
          "steps": ["Step 1", "Step 2", "Step 3"]
        }
      ]
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.workflows;
}

// Generate function chart from existing workflows
export async function generateFunctionChart(
  workflows: Workflow[],
  phases: Phase[],
  steps: Step[],
  companyProfile?: CompanyProfile | null,
  modelId: ModelId = "gemini-flash"
): Promise<GeneratedFunctionChart> {
  const model = genAI.getGenerativeModel({ model: MODELS[modelId].modelId });

  // Build workflow context
  const workflowContext = workflows.map((wf) => {
    const wfPhases = phases
      .filter((p) => p.workflowId === wf.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const phasesWithSteps = wfPhases.map((phase) => {
      const phaseSteps = steps
        .filter((s) => s.phaseId === phase.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return `  ${phase.name}:\n${phaseSteps.map((s) => `    - ${s.name}`).join("\n")}`;
    });
    return `${wf.name}:\n${phasesWithSteps.join("\n")}`;
  }).join("\n\n");

  const prompt = `${getSystemPrompt(companyProfile)}

${getDataModelContext()}

TASK: Based on the following workflows, generate a comprehensive Function Chart that organizes the business operations.

EXISTING WORKFLOWS:
${workflowContext}

Generate a function chart with:
1. 6-8 top-level Functions covering all business areas (typical for construction: Marketing, Sales, Design, Estimating, Production, Finance, Administration)
2. 2-5 Sub-Functions under each Function
3. 3-8 Core Activities under each Sub-Function
4. Appropriate colors for visual distinction (use hex codes)

Activities should be derived from the workflow steps where applicable, plus additional standard activities for each function area.

Respond with ONLY valid JSON in this format (no markdown, no explanation):
{
  "functions": [
    {
      "name": "Function Name",
      "description": "Brief description",
      "color": "#3B82F6",
      "subFunctions": [
        {
          "name": "Sub-Function Name",
          "activities": ["Activity 1", "Activity 2"]
        }
      ]
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

// Analyze gaps in operations
export async function analyzeGaps(
  workflows: Workflow[],
  phases: Phase[],
  steps: Step[],
  functions: Function[],
  subFunctions: SubFunction[],
  activities: CoreActivity[],
  companyProfile?: CompanyProfile | null,
  modelId: ModelId = "gemini-flash"
): Promise<GeneratedGap[]> {
  const model = genAI.getGenerativeModel({ model: MODELS[modelId].modelId });

  // Build current state context
  const workflowContext = workflows.map((wf) => {
    const wfPhases = phases.filter((p) => p.workflowId === wf.id);
    return `${wf.name}: ${wfPhases.map((p) => p.name).join(" → ")}`;
  }).join("\n");

  const functionContext = functions.map((f) => {
    const subs = subFunctions.filter((sf) => sf.functionId === f.id);
    return `${f.name}: ${subs.map((s) => s.name).join(", ")}`;
  }).join("\n");

  const prompt = `${getSystemPrompt(companyProfile)}

${getDataModelContext()}

TASK: Analyze this construction company's operations and identify gaps, inefficiencies, and areas for improvement.

CURRENT WORKFLOWS:
${workflowContext || "No workflows defined yet"}

CURRENT FUNCTION CHART:
${functionContext || "No functions defined yet"}

TOTAL ACTIVITIES: ${activities.length}

Based on industry best practices and the company profile, identify:
1. Missing critical workflows or processes
2. Incomplete workflow phases or steps
3. Missing functions or sub-functions in the org chart
4. Activities that should exist but don't
5. General operational improvements

For each gap, assess priority:
- Critical: Essential for business operation, causes significant issues if missing
- Important: Would meaningfully improve operations
- Nice-to-have: Good to have but not urgent

Respond with ONLY valid JSON in this format (no markdown, no explanation):
{
  "gaps": [
    {
      "title": "Gap Title",
      "description": "Detailed description of the gap",
      "category": "workflow|function-chart|activity|general",
      "priority": "critical|important|nice-to-have",
      "recommendation": "Specific recommendation to address this gap"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.gaps;
}

// Analyze meeting notes and suggest updates
export async function analyzeMeetingNotes(
  notes: string,
  workflows: Workflow[],
  phases: Phase[],
  steps: Step[],
  companyProfile?: CompanyProfile | null,
  modelId: ModelId = "gemini-flash"
): Promise<{
  workflowSuggestions: { workflowName: string; suggestion: string; type: "add-phase" | "add-step" | "modify" }[];
  newGaps: GeneratedGap[];
  summary: string;
}> {
  const model = genAI.getGenerativeModel({ model: MODELS[modelId].modelId });

  const workflowContext = workflows.map((wf) => {
    const wfPhases = phases
      .filter((p) => p.workflowId === wf.id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const phasesWithSteps = wfPhases.map((phase) => {
      const phaseSteps = steps
        .filter((s) => s.phaseId === phase.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return `  ${phase.name}: ${phaseSteps.map((s) => s.name).join(", ")}`;
    });
    return `${wf.name}:\n${phasesWithSteps.join("\n")}`;
  }).join("\n\n");

  const prompt = `${getSystemPrompt(companyProfile)}

${getDataModelContext()}

TASK: Analyze these meeting notes and suggest updates to the company's operations documentation.

MEETING NOTES:
"""
${notes}
"""

CURRENT WORKFLOWS:
${workflowContext || "No workflows defined yet"}

Identify:
1. Workflow changes suggested or implied in the meeting
2. New processes mentioned that should be documented
3. Problems or gaps discovered during the meeting
4. Action items that indicate process changes

Respond with ONLY valid JSON in this format (no markdown, no explanation):
{
  "summary": "Brief summary of key operational insights from the meeting",
  "workflowSuggestions": [
    {
      "workflowName": "Name of workflow to modify (or 'NEW' for new workflow)",
      "suggestion": "Description of the suggested change",
      "type": "add-phase|add-step|modify"
    }
  ],
  "newGaps": [
    {
      "title": "Gap discovered in meeting",
      "description": "Details",
      "category": "workflow|function-chart|activity|general",
      "priority": "critical|important|nice-to-have",
      "recommendation": "Recommendation"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

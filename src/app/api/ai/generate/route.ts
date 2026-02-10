import { NextResponse } from "next/server";
import {
  generateWorkflowsFromTranscript,
  generateFunctionChart,
  analyzeGaps,
  analyzeMeetingNotes,
  type ModelId,
} from "@/lib/ai";
import type { CompanyProfile, Workflow, Phase, Step, Function, SubFunction, CoreActivity } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60; // AI generation can take a while

type AIAction = "workflows" | "functionChart" | "gapAnalysis" | "meetingAnalysis";

interface GenerateRequest {
  action: AIAction;
  model?: ModelId;
  companyProfile?: CompanyProfile | null;
  // For workflows generation
  transcript?: string;
  // For function chart & gap analysis
  workflows?: Workflow[];
  phases?: Phase[];
  steps?: Step[];
  functions?: Function[];
  subFunctions?: SubFunction[];
  activities?: CoreActivity[];
  // For meeting analysis
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const body: GenerateRequest = await req.json();
    const { action, model = "gemini-flash", companyProfile } = body;

    switch (action) {
      case "workflows": {
        if (!body.transcript) {
          return NextResponse.json(
            { error: "Transcript is required for workflow generation" },
            { status: 400 }
          );
        }
        const workflows = await generateWorkflowsFromTranscript(
          body.transcript,
          companyProfile,
          model
        );
        return NextResponse.json({ workflows });
      }

      case "functionChart": {
        if (!body.workflows || !body.phases || !body.steps) {
          return NextResponse.json(
            { error: "Workflows, phases, and steps are required for function chart generation" },
            { status: 400 }
          );
        }
        const functionChart = await generateFunctionChart(
          body.workflows,
          body.phases,
          body.steps,
          companyProfile,
          model
        );
        return NextResponse.json(functionChart);
      }

      case "gapAnalysis": {
        const gaps = await analyzeGaps(
          body.workflows || [],
          body.phases || [],
          body.steps || [],
          body.functions || [],
          body.subFunctions || [],
          body.activities || [],
          companyProfile,
          model
        );
        return NextResponse.json({ gaps });
      }

      case "meetingAnalysis": {
        if (!body.notes) {
          return NextResponse.json(
            { error: "Meeting notes are required for analysis" },
            { status: 400 }
          );
        }
        const analysis = await analyzeMeetingNotes(
          body.notes,
          body.workflows || [],
          body.phases || [],
          body.steps || [],
          companyProfile,
          model
        );
        return NextResponse.json(analysis);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI generation failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildLLMSnapshot, getAssistantContext } from "@/lib/ai/context";
import { answerQuestion } from "@/lib/recommendations";
import { askClaude, isClaudeEnabled } from "@/lib/ai/claude";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const question = typeof body?.question === "string" ? body.question : "";
  if (!question.trim()) return NextResponse.json({ error: "Question manquante" }, { status: 400 });

  const { roster, projects } = await getAssistantContext();

  if (isClaudeEnabled()) {
    try {
      const snapshot = buildLLMSnapshot(roster, projects);
      const answer = await askClaude(question, snapshot);
      return NextResponse.json({ answer, source: "claude" });
    } catch {
      const a = answerQuestion(question, { roster, projects });
      return NextResponse.json({ answer: a.markdown, source: "rules", note: "IA externe indisponible — repli local." });
    }
  }

  const a = answerQuestion(question, { roster, projects });
  return NextResponse.json({ answer: a.markdown, source: "rules" });
}

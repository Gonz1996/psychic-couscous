import Anthropic from "@anthropic-ai/sdk";

export function isClaudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `Tu es l'assistant d'aide à la décision d'une firme de génie-conseil MEP (mécanique, électricité, plomberie).
Tu réponds en français, de façon concise et actionnable, en te basant UNIQUEMENT sur l'instantané JSON fourni (charge des employés et état des projets).
Cite des noms, des pourcentages et des numéros de projet précis. Structure tes réponses en listes Markdown courtes.
Si une information n'est pas disponible dans les données, dis-le clairement plutôt que d'inventer.`;

export async function askClaude(question: string, snapshot: unknown): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Données (JSON) :\n${JSON.stringify(snapshot)}\n\nQuestion : ${question}`,
      },
    ],
  });

  const text = msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  return text || "Aucune réponse générée.";
}

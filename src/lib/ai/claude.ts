import Anthropic from "@anthropic-ai/sdk";

export function isClaudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `Tu es le copilote d'aide à la décision d'une firme de génie-conseil MEP (mécanique, électricité, plomberie, gicleurs) au Québec.
Tu réponds en français, de façon concise et actionnable, en te basant UNIQUEMENT sur l'instantané JSON fourni. Il contient :
- firme : revenu/dépenses/résultat net + obligations fiscales (TPS/TVQ/DAS/pénalités) ;
- capaciteParDiscipline : effectif, capacité hebdo, taux chargé moyen, utilisation récente, disponibilité ;
- employes : discipline, taux chargé, utilisation, disponibilité ;
- projets : client, phase (conception/surveillance), honoraires, coût réel, marge RÉELLE (QuickBooks) et marge projetée, avancement, risque.
Objectif d'affaires central : maintenir une marge ≥ 30 % par projet. Pour « puis-je accepter un mandat de X $ ? », estime le budget de production (≈ 55 % des honoraires après 30 % profit + 10 % frais + 5 % réserve), les heures requises (÷ taux chargé moyen) et compare à la disponibilité par discipline.
Cite des noms, des montants, des pourcentages et des numéros de projet précis. Structure en listes Markdown courtes.
Si une information n'est pas dans les données, dis-le plutôt que d'inventer.`;

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

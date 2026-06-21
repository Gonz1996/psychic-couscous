import * as React from "react";

// Rendu Markdown minimal (gras, listes, paragraphes) pour les réponses
// du moteur de recommandations / de l'assistant IA. Contenu maîtrisé.

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s: string) {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, i) => (
      <li key={i} dangerouslySetInnerHTML={{ __html: inline(it) }} />
    ));
    blocks.push(
      list.ordered ? (
        <ol key={blocks.length} className="ml-5 list-decimal space-y-1">
          {items}
        </ol>
      ) : (
        <ul key={blocks.length} className="ml-5 list-disc space-y-1">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const um = line.match(/^[-•]\s+(.*)$/);
    const om = line.match(/^\d+\.\s+(.*)$/);
    if (um) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(um[1]);
      continue;
    }
    if (om) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(om[1]);
      continue;
    }
    flush();
    blocks.push(<p key={blocks.length} dangerouslySetInnerHTML={{ __html: inline(line) }} />);
  }
  flush();

  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>;
}

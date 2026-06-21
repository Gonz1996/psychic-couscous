"use client";
import * as React from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SimpleMarkdown } from "@/components/shared/simple-markdown";

interface Msg {
  role: "user" | "assistant";
  text: string;
  source?: string;
}

export function Assistant({ suggestions, claudeEnabled }: { suggestions: string[]; claudeEnabled: boolean }) {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.answer ?? data.error ?? "Erreur.", source: data.source }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Erreur de communication avec le serveur." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Assistant IA
            </CardTitle>
            <CardDescription>Questions en langage naturel sur la charge et les projets</CardDescription>
          </div>
          <Badge variant={claudeEnabled ? "default" : "secondary"}>
            {claudeEnabled ? "Claude activé" : "Moteur de règles"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sélectionnez une question suggérée ou écrivez la vôtre pour commencer.
            </p>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                {m.text}
              </div>
            ) : (
              <div key={i} className="w-fit max-w-[90%] rounded-lg border bg-card px-3 py-2">
                <SimpleMarkdown text={m.text} />
                {m.source && (
                  <div className="mt-1.5 text-[10px] text-muted-foreground">
                    via {m.source === "claude" ? "Claude" : "moteur de règles"}
                  </div>
                )}
              </div>
            ),
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Analyse en cours…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Votre question…" />
          <Button type="submit" size="icon" disabled={loading}>
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

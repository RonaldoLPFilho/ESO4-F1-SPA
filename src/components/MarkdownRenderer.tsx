import type { ReactNode } from "react";

type MarkdownRendererProps = {
  content: string;
};

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-code-${index}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-emerald-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (!text) {
      paragraph = [];
      return;
    }
    nodes.push(
      <p key={`p-${nodes.length}`} className="text-sm leading-7 text-slate-700">
        {renderInline(text, `p-${nodes.length}`)}
      </p>
    );
    paragraph = [];
  }

  function flushBullets() {
    if (!bullets.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="space-y-2 pl-5 text-sm leading-7 text-slate-700">
        {bullets.map((item, index) => (
          <li key={`li-${index}`} className="list-disc">
            {renderInline(item, `li-${index}`)}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushBullets();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushBullets();
      nodes.push(
        <h1 key={`h1-${nodes.length}`} className="text-2xl font-semibold text-slate-900">
          {renderInline(line.slice(2), `h1-${nodes.length}`)}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushBullets();
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="text-xl font-semibold text-slate-900">
          {renderInline(line.slice(3), `h2-${nodes.length}`)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      bullets.push(line.slice(2));
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushBullets();

  return <div className="space-y-4">{nodes}</div>;
}

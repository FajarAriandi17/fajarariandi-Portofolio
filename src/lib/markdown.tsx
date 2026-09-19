import { Fragment, type ReactNode } from "react";

/**
 * A deliberately small Markdown renderer for blog bodies.
 *
 * It emits React elements directly rather than an HTML string, so there is no
 * `dangerouslySetInnerHTML` anywhere and a post body can never inject markup —
 * which matters because bodies will be authored in the CMS by a non-developer.
 *
 * Supports: h2/h3, paragraphs, ordered/unordered lists, blockquotes, horizontal
 * rules, and inline bold / italic / code / links.
 */

/* --------------------------------------------------------------------------
   Inline
   -------------------------------------------------------------------------- */

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE_PATTERN).filter(Boolean).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded-md border border-line bg-elevated/70 px-1.5 py-0.5 font-mono text-[0.85em] text-accent-cyan"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    // Italic — must be checked after bold, since ** also starts with *.
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={key} className="italic text-ink-soft">
          {token.slice(1, -1)}
        </em>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
    if (link) {
      const [, label, href] = link;
      const isExternal = /^https?:\/\//.test(href);
      return (
        <a
          key={key}
          href={href}
          className="text-accent-cyan underline decoration-accent-cyan/30 underline-offset-4 transition-colors hover:decoration-accent-cyan"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>
      );
    }

    return <Fragment key={key}>{token}</Fragment>;
  });
}

/* --------------------------------------------------------------------------
   Block
   -------------------------------------------------------------------------- */

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "rule" };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ kind: "quote", lines: quote });
      quote = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ kind: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Blank line closes whatever is open.
    if (!line.trim()) {
      flushAll();
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushAll();
      blocks.push({ kind: "rule" });
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      blocks.push({
        kind: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2].trim(),
      });
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      quote.push(line.slice(2).trim());
      continue;
    }

    const unordered = /^[-*]\s+(.*)$/.exec(line);
    const ordered = /^\d+\.\s+(.*)$/.exec(line);

    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const isOrdered = Boolean(ordered);
      const content = (unordered?.[1] ?? ordered?.[1] ?? "").trim();

      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push(content);
      continue;
    }

    flushQuote();
    flushList();
    paragraph.push(line.trim());
  }

  flushAll();
  return blocks;
}

/* --------------------------------------------------------------------------
   Component-facing API
   -------------------------------------------------------------------------- */

export function renderMarkdown(markdown: string): ReactNode {
  const blocks = parseBlocks(markdown);

  return blocks.map((block, index) => {
    const key = `block-${index}`;

    switch (block.kind) {
      case "heading":
        return block.level === 2 ? (
          <h2 key={key} className="mt-14 mb-5 scroll-mt-28 text-2xl font-semibold sm:text-3xl">
            {renderInline(block.text, key)}
          </h2>
        ) : (
          <h3 key={key} className="mt-10 mb-4 scroll-mt-28 text-xl font-semibold sm:text-2xl">
            {renderInline(block.text, key)}
          </h3>
        );

      case "paragraph":
        return (
          <p key={key} className="my-5 leading-[1.8] text-ink-soft">
            {renderInline(block.text, key)}
          </p>
        );

      case "quote":
        return (
          <blockquote
            key={key}
            className="my-8 border-l-2 border-accent-violet/60 pl-6 text-lg italic leading-relaxed text-ink-muted"
          >
            {block.lines.map((line, i) => (
              <Fragment key={`${key}-${i}`}>
                {renderInline(line, `${key}-${i}`)}
                {i < block.lines.length - 1 ? " " : null}
              </Fragment>
            ))}
          </blockquote>
        );

      case "list":
        return block.ordered ? (
          <ol key={key} className="my-6 list-decimal space-y-3 pl-6 text-ink-soft marker:text-accent-cyan">
            {block.items.map((item, i) => (
              <li key={`${key}-${i}`} className="leading-[1.75] pl-1">
                {renderInline(item, `${key}-${i}`)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={key} className="my-6 space-y-3 pl-6 text-ink-soft">
            {block.items.map((item, i) => (
              <li key={`${key}-${i}`} className="relative leading-[1.75]">
                <span
                  aria-hidden
                  className="absolute -left-5 top-[0.7em] size-1.5 rounded-full bg-accent-cyan"
                />
                {renderInline(item, `${key}-${i}`)}
              </li>
            ))}
          </ul>
        );

      case "rule":
        return <hr key={key} className="rule-fade my-12" />;
    }
  });
}

/** Rough reading time, used when a CMS post doesn't supply one. */
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

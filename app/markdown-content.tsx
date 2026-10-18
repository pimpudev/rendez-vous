import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-slate-300 pl-4 italic">{children}</blockquote>,
  h1: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold">{children}</h2>,
  h2: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-bold">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-2 mt-3 font-bold">{children}</h4>,
};

export default function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

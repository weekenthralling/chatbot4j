import { memo } from "react";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { useTheme } from "@/hooks/useTheme";

const MarkdownContent = ({ text }: { title?: string; text: string }) => {
  const { codeTheme } = useTheme();

  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code(props) {
          // Note the `ref` argument. Removing it will cause a typescript error.
          // See <https://github.com/remarkjs/react-markdown/issues/666>
          const { children, className, node, ref, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          if (!match) {
            return (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          }
          return (
            <div className="my-4">
              <SyntaxHighlighter {...rest} PreTag="div" language={match[1]} style={codeTheme}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          );
        },
        p: ({ children }) => <p className="my-3">{children}</p>,
        ul: ({ children }) => <ul className="my-3 ml-4 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="my-3 ml-4 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="my-1">{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-bold my-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold my-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-bold my-3">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 pl-4 border-l-4 border-gray-300 italic">
            {children}
          </blockquote>
        ),
        table: ({ node, ...props }) => (
          <div className="w-full overflow-x-auto">
            <table
              className="min-w-full border-[0.5px] rounded-[6px] border-gray-200 markdown-table"
              {...props}
            />
          </div>
        ),
        thead: ({ children }) => <thead className="text-[12px]">{children}</thead>,
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-200 text-[12px]">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="text-[12px] border-[0.5px] border-gray-200 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1 text-left text-[12px] font-medium border-b border-[0.5px] border-gray-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="w-[200px] px-2 py-1 text-[12px] border-b border-gray-100 border-[0.5px] markdown-td">
            {children}
          </td>
        ),
      }}
    >
      {text}
    </Markdown>
  );
};

export default memo(MarkdownContent);

// components/common/markdown-renderer.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("markdown-content", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-semibold text-white mt-8 mb-3 pb-2 border-b border-gray-800">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-medium text-white mt-6 mb-2">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-medium text-gray-200 mt-4 mb-2">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="text-gray-300 leading-relaxed mb-4 last:mb-0">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-200">{children}</em>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="space-y-1.5 mb-4 text-gray-300 ml-1">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1.5 mb-4 text-gray-300 ml-1">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-gray-300 leading-relaxed flex items-start gap-2">
                            <span className="text-sky-500 mt-1.5 shrink-0">•</span>
                            <span>{children}</span>
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-sky-500/50 pl-4 py-2 my-4 bg-sky-500/5 rounded-r-lg italic">
                            {children}
                        </blockquote>
                    ),
                    hr: () => (
                        <hr className="my-6 border-gray-800" />
                    ),
                    img: ({ src, alt }) => (
                        <span className="block my-4">
              <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-lg border border-gray-800 max-w-full h-auto"
                  loading="lazy"
              />
                            {alt && (
                                <span className="block text-center text-xs text-gray-500 mt-2 italic">
                  {alt}
                </span>
                            )}
            </span>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-gray-800">
                            <table className="w-full text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-800/80">
                        {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-800/50">
                        {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-800/20 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2.5 text-left font-medium text-gray-200 whitespace-nowrap">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2.5 text-gray-300">
                            {children}
                        </td>
                    ),
                    code: ({ className: codeClassName, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                        const match = /language-(\w+)/.exec(codeClassName || '');
                        const isInline = !match && !codeClassName;

                        if (isInline) {
                            return (
                                <code className="bg-gray-800 text-sky-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono">
                                    {children}
                                </code>
                            );
                        }

                        const language = match ? match[1] : 'text';

                        return (
                            <div className="my-4 rounded-lg overflow-hidden border border-gray-800">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 border-b border-gray-700">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {language}
                  </span>
                                    <span className="text-xs text-gray-600">código</span>
                                </div>
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={language}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: 0,
                                        background: 'rgb(17, 24, 39)',
                                        fontSize: '0.85rem',
                                        lineHeight: '1.6',
                                        padding: '1rem 1.25rem',
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        );
                    },
                    pre: ({ children }) => <>{children}</>,
                    details: ({ children }) => (
                        <details className="my-4 bg-gray-800/30 border border-gray-700/50 rounded-lg overflow-hidden group">
                            {children}
                        </details>
                    ),
                    summary: ({ children }) => (
                        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-sky-400 hover:text-sky-300 hover:bg-gray-800/50 transition-colors select-none list-none flex items-center gap-2">
                            <span className="transition-transform duration-200 group-open:rotate-90 text-xs">▶</span>
                            {children}
                        </summary>
                    ),
                    input: ({ type, checked, ...props }: ComponentPropsWithoutRef<'input'>) => {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="mr-2 rounded border-gray-600 bg-gray-800 text-sky-500 focus:ring-sky-500/50"
                                    {...props}
                                />
                            );
                        }
                        return <input type={type} {...props} />;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
"use client";

import React from "react";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCopy } from "react-icons/fa";

// sometimes typescript I ACTUALLY DON'T CARE ABOUT TYPES!!!

type CodeBlockProps = NonNullable<Components["code"]>;
const CodeBlock = ({
    /*@ts-ignore*/
    inline,
    /*@ts-ignore*/
    className,
    /*@ts-ignore*/
    children,
    /*@ts-ignore*/
    ...props
}: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = React.Children.toArray(children)
        .join("")
        .replace(/^\n+/, "")
        .replace(/\n$/, "");

    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);

    if (!inline && match) {
        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(codeString);
                setCopied(true);
            } catch {
                const textarea = document.createElement("textarea");
                textarea.value = codeString;
                textarea.style.position = "fixed";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                setCopied(true);
            }
        };

        return (
            <div className="relative not-prose">
                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                >
                    <FaCopy /> Copy
                </button>

                <span
                    className={`absolute top-10 right-2 text-white text-xs transition-all ${
                        copied ? "opacity-100" : "opacity-0"
                    }`}
                >
                    Copied to clipboard!
                </span>

                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="pre"
                    customStyle={{
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        margin: 0,
                        overflowX: "auto",
                    }}
                    {...props}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        );
    }

    return (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

export default CodeBlock;

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import CodeBlock from "./CodeBlock";

type Props = {
    content: string;
};

export default function MarkdownRenderer({ content }: Props) {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
                // @ts-ignore
                code: CodeBlock,

                img({ src, alt }: any) {

                    src = src.replaceAll(
                        "https://files.latific.click/file/",
                        "/api/media/"
                    );

                    // video
                    if (src?.endsWith(".mp4")) {
                        return (
                            <span style={{ display: "block" }}>
                                <video
                                    controls
                                    playsInline
                                    preload="metadata"
                                    style={{
                                        width: "100%",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <source src={src} type="video/mp4" />
                                    {alt}
                                </video>
                            </span>
                        );
                    }

                    // audio
                    if (src && /\.(mp3|wav|ogg)$/i.test(src)) {
                        return (
                            <span style={{ display: "block" }}>
                                <audio
                                    controls
                                    preload="metadata"
                                    style={{ width: "100%" }}
                                >
                                    <source
                                        src={src}
                                        type={`audio/${src
                                            .split(".")
                                            .pop()
                                            ?.toLowerCase()}`}
                                    />
                                    Your browser does not support audio.
                                </audio>
                            </span>
                        );
                    }

                    // default image
                    return <img src={src} alt={alt} />;
                },

                steamgame({ children }: any) {
                    const appId = children;
                    return (
                        <iframe
                            src={`https://store.steampowered.com/widget/${appId}`}
                            style={{
                                border: 0,
                                width: "100%",
                                height: "190px",
                            }}
                            frameBorder="0"
                            scrolling="no"
                        >
                            Steam iframe failed to load 😔
                        </iframe>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

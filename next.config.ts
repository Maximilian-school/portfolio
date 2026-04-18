import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import nextMdx from "@next/mdx";

const withMdx = nextMdx({
    extension: /\.mdx?$/,
    options: {
        /* otherOptions… */
    },
});

const nextConfig = withMdx({
    pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
});

export default nextConfig;

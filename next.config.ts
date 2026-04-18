import nextMdx from "@next/mdx";
import type { NextConfig } from "next";

const withMdx = nextMdx({
    options: {
        remarkPlugins: ["remark-math"],
        rehypePlugins: ["rehype-katex"],
    },
});

const nextConfig: NextConfig = {
    pageExtensions: ["md", "mdx", "tsx", "ts", "jsx", "js"],
};

export default withMdx(nextConfig);

export type Blog = {
    id: number;
    title: string;
    content: string;
    slug: string;
    created_at: string;
};

import * as React from "react";

declare module "mdx/types.js" {
    export import JSX = React.JSX;
}

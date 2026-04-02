import type { ASTNode } from "@nisoku/sakko";
export declare type VNode = {
    type: string;
    props: Record<string, any>;
    children: (VNode | string)[];
};
export declare function getTag(name: string): string;
export declare function transformAST(node: ASTNode): VNode | VNode[];

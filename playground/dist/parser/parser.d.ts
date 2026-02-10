import { Token } from './tokenizer';
export type Modifier = {
    type: "flag";
    value: string;
} | {
    type: "pair";
    key: string;
    value: string;
};
export type RootNode = {
    type: "root";
    name: string;
    modifiers: Modifier[];
    children: ASTNode[];
};
export type ElementNode = {
    type: "element";
    name: string;
    modifiers: Modifier[];
    children: ASTNode[];
};
export type InlineNode = {
    type: "inline";
    name: string;
    modifiers: Modifier[];
    value: string;
};
export type ListNode = {
    type: "list";
    items: ASTNode[];
};
export type ASTNode = ElementNode | InlineNode | ListNode;
export declare class Parser {
    tokens: Token[];
    position: number;
    private source;
    constructor(tokens: Token[], source?: string);
    private errorAt;
    peek(): Token | undefined;
    consume(): Token;
    check(type: string): boolean;
    expect(type: string, errorMsg?: string): Token;
    parseRoot(): RootNode;
    parseNode(): ASTNode;
    parseModifiers(): Modifier[];
    parseList(): ListNode;
}
export declare function parseSakko(input: string): RootNode;

export type TokenType = "LT" | "GT" | "LBRACE" | "RBRACE" | "LPAREN" | "RPAREN" | "LBRACKET" | "RBRACKET" | "COLON" | "SEMI" | "COMMA" | "IDENT" | "STRING";
export type Token = {
    type: TokenType;
    value: string;
    line: number;
    col: number;
};
export declare function tokenize(input: string): Token[];

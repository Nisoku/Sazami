export interface ComponentErrorOptions {
    tag?: string;
    suggestion?: string;
    cause?: string;
}
export declare function unknownComponentError(component: string, suggestion?: string): void;
export declare function propertyError(message: string, options: ComponentErrorOptions): void;
export declare function eventError(message: string, options: ComponentErrorOptions): void;
export declare function renderError(message: string, options: {
    suggestion?: string;
    cause?: string;
}): void;
export declare function bindingError(message: string, options: {
    property?: string;
    suggestion?: string;
}): void;

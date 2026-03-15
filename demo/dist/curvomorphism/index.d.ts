export declare function applyCurvomorphism(element: HTMLElement, centerX: number, centerY: number, radiusValue?: string, groupLeft?: number, groupRight?: number, groupTop?: number, groupBottom?: number): void;
export declare function enableCurvomorphism(element: HTMLElement, options?: {
    radius?: string;
    centerX?: number;
    centerY?: number;
    groupLeft?: number;
    groupRight?: number;
    groupTop?: number;
    groupBottom?: number;
}): () => void;

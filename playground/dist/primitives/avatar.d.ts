import { SazamiComponent } from './base';
declare const avatarConfig: {
    readonly properties: {
        readonly src: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly alt: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly initials: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly shape: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiAvatar extends SazamiComponent<typeof avatarConfig> {
    src: string;
    alt: string;
    initials: string;
    size: string;
    shape: string;
    render(): void;
    private _getInitials;
}
export {};

import { SazamiComponent, SazamiComponentConfig } from './base';
export declare function createGenericClass<C extends SazamiComponentConfig = any>(config?: C): {
    new (): SazamiComponent<C>;
};

import { ICallback, IScriptConfig, ITinyCacheConfig } from "./types";
export declare class TinyCache {
    private config;
    constructor(config?: ITinyCacheConfig);
    load(scripts: IScriptConfig[]): Promise<void>;
    load(scripts: IScriptConfig[], callback: ICallback<Array<null | undefined>>): void;
    remove(script: IScriptConfig): void;
    private loadScript;
}

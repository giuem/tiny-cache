import { ICallback, IScriptConfig, ITinyCacheConfig } from "./types";
export declare class TinyCache {
    private config;
    constructor(config?: ITinyCacheConfig);
    load(scripts: IScriptConfig[], callback?: ICallback<Array<null | undefined>>): Promise<{}> | undefined;
    private loadScript;
}

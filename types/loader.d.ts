import { ICallback, IScriptConfig } from "./types";
export declare function LoadScriptEl(script: IScriptConfig, content: string): void;
export declare function LoadScriptFallback(script: IScriptConfig, callback: ICallback<null>): void;
export declare function LoadScriptFromXHR(script: IScriptConfig, timeout: number, callback: ICallback<string>): void;
export declare function LoadScriptFromStorage(prefix: string, script: IScriptConfig, callback: ICallback<string>): void;
export declare function SaveScriptToStorage(prefix: string, script: IScriptConfig, content: string): void;

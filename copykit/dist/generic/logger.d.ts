declare function success(...msgArray: string[]): void;
declare function error(...msgArray: string[]): void;
declare function info(...msgArray: string[]): void;
declare function warn(...msgArray: string[]): void;
declare function init(...msgArray: string[]): void;
declare function caught(err: any): void;
declare const _default: {
    success: typeof success;
    error: typeof error;
    info: typeof info;
    warn: typeof warn;
    init: typeof init;
    caught: typeof caught;
};
export default _default;
//# sourceMappingURL=logger.d.ts.map
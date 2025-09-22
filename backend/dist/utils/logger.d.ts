declare class Logger {
    private logLevel;
    private isDevelopment;
    constructor();
    private formatMessage;
    private log;
    error(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    requestLogger(): (req: any, res: any, next: any) => void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map
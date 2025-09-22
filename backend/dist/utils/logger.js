"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL ?
            parseInt(process.env.LOG_LEVEL) : LogLevel.INFO;
        this.isDevelopment = process.env.NODE_ENV !== 'production';
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...(data && { data })
        };
        if (this.isDevelopment) {
            let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            if (data) {
                formatted += `\n${JSON.stringify(data, null, 2)}`;
            }
            return formatted;
        }
        else {
            return JSON.stringify(logEntry);
        }
    }
    log(level, levelName, message, data) {
        if (level <= this.logLevel) {
            const formatted = this.formatMessage(levelName, message, data);
            switch (level) {
                case LogLevel.ERROR:
                    console.error(formatted);
                    break;
                case LogLevel.WARN:
                    console.warn(formatted);
                    break;
                case LogLevel.INFO:
                    console.info(formatted);
                    break;
                case LogLevel.DEBUG:
                    console.log(formatted);
                    break;
            }
        }
    }
    error(message, data) {
        this.log(LogLevel.ERROR, 'error', message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, 'warn', message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, 'info', message, data);
    }
    debug(message, data) {
        this.log(LogLevel.DEBUG, 'debug', message, data);
    }
    requestLogger() {
        return (req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logData = {
                    method: req.method,
                    url: req.url,
                    status: res.statusCode,
                    duration: `${duration}ms`,
                    userAgent: req.get('user-agent'),
                    ip: req.ip
                };
                if (res.statusCode >= 400) {
                    this.warn(`${req.method} ${req.url} - ${res.statusCode}`, logData);
                }
                else {
                    this.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
                }
            });
            next();
        };
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map
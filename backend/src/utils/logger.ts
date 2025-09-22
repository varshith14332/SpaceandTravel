enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL ? 
      parseInt(process.env.LOG_LEVEL) : LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    if (this.isDevelopment) {
      // Pretty formatting for development
      let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      if (data) {
        formatted += `\n${JSON.stringify(data, null, 2)}`;
      }
      return formatted;
    } else {
      // JSON formatting for production
      return JSON.stringify(logEntry);
    }
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
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

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'error', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'warn', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'info', message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, data);
  }

  // Request logging middleware
  requestLogger() {
    return (req: any, res: any, next: any) => {
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
        } else {
          this.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
        }
      });
      
      next();
    };
  }
}

export const logger = new Logger();

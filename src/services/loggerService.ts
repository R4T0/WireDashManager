
/**
 * Simple logging service for debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private static instance: Logger;
  private logs: {level: LogLevel, message: string, data?: any, timestamp: Date}[] = [];
  private maxLogs: number = 100;
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, message: string, data?: any): void {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date()
    };
    
    console.log(`${level.toUpperCase()}: ${message}`, data || '');
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log if exceeding max logs
    }
  }

  public info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  public debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  public getLogs(): {level: LogLevel, message: string, data?: any, timestamp: Date}[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
export default logger;

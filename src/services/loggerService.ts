
/**
 * Simple logging service for debugging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'request';

class Logger {
  private static instance: Logger;
  private logs: {level: LogLevel, message: string, data?: any, timestamp: Date}[] = [];
  private maxLogs: number = 200;
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Helper to sanitize objects that might contain circular references before storing them
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    try {
      // For DOM elements or window objects, return simplified representation
      if (data instanceof Element || data === window || data === document) {
        return `[${data.constructor.name}]`;
      }
      
      // For Error objects, extract useful properties
      if (data instanceof Error) {
        return {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      }
      
      // For arrays, sanitize each item
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      }
      
      // For objects, create a clean copy without circular references
      const seen = new WeakSet();
      const sanitizeObj = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        
        // Handle circular references
        if (seen.has(obj)) {
          return '[Circular Reference]';
        }
        
        seen.add(obj);
        
        const result: any = Array.isArray(obj) ? [] : {};
        
        // Process only the first 100 properties to prevent excessive processing
        const keys = Object.keys(obj).slice(0, 100);
        
        for (const key of keys) {
          try {
            const value = obj[key];
            
            // Skip functions and DOM elements
            if (typeof value === 'function') {
              result[key] = '[Function]';
            } else if (value instanceof Element || value === window || value === document) {
              result[key] = `[${value.constructor.name}]`;
            } else if (typeof value === 'object' && value !== null) {
              result[key] = sanitizeObj(value);
            } else {
              result[key] = value;
            }
          } catch (err) {
            result[key] = `[Error accessing property: ${key}]`;
          }
        }
        
        return result;
      };
      
      return sanitizeObj(data);
    } catch (err) {
      return `[Error sanitizing data: ${err instanceof Error ? err.message : String(err)}]`;
    }
  }

  public log(level: LogLevel, message: string, data?: any): void {
    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    
    const logEntry = {
      level,
      message,
      data: sanitizedData,
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
  
  public request(message: string, data?: any): void {
    this.log('request', message, data);
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

/**
 * Умная система логирования для разработки и production
 * 
 * В development: все логи работают
 * В production: только error и warn (опционально)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enableInProduction: boolean;
  minLevel: LogLevel;
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableInProduction: false,
      minLevel: 'info',
      prefix: '',
      ...config,
    };
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // В production логируем только если явно разрешено
    if (!this.isDevelopment && !this.config.enableInProduction) {
      return level === 'error'; // В production только критические ошибки
    }

    // Проверяем минимальный уровень
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    return `${timestamp} ${prefix} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message), error, ...args);
      
      // В production можно отправлять ошибки в сервис мониторинга
      if (!this.isDevelopment) {
        this.sendToMonitoring(message, error);
      }
    }
  }

  private sendToMonitoring(message: string, error?: Error | unknown): void {
    // TODO: Интеграция с сервисом мониторинга (Sentry, LogRocket, etc.)
    // Пока просто заглушка
    if (typeof window !== 'undefined') {
      // Можно отправить на /api/logs или в внешний сервис
    }
  }

  /**
   * Создаёт дочерний логгер с префиксом
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    });
  }
}

// Глобальный логгер
export const logger = new Logger();

// Специализированные логгеры для разных частей приложения
export const authLogger = logger.child('Auth');
export const apiLogger = logger.child('API');
export const editorLogger = logger.child('Editor');
export const aiLogger = logger.child('AI');
export const storageLogger = logger.child('Storage');
export const paymentLogger = logger.child('Payment');

// Хелпер для замены console.log в существующем коде
export const devLog = (...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};

export const devError = (...args: any[]): void => {
  console.error(...args); // Ошибки всегда показываем
};


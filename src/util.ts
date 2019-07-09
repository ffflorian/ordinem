import * as logdown from 'logdown';
import * as moment from 'moment';

class ExtendedLogger {
  private readonly logger: logdown.Logger;

  constructor(postfix: string) {
    this.logger = logdown(`ordinem/${postfix}`, {
      logger: console,
      markdown: false,
    });
  }

  debug(...args: any[]): void {
    this.logger.debug(`[${formatDate()}]`, ...args);
  }

  error(...args: any[]): void {
    this.logger.error(`[${formatDate()}]`, ...args);
  }

  info(...args: any[]): void {
    this.logger.info(`[${formatDate()}]`, ...args);
  }

  warn(...args: any[]): void {
    this.logger.warn(`[${formatDate()}]`, ...args);
  }
}

function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

export {ExtendedLogger, formatDate};

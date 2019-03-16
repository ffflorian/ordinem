import * as logdown from 'logdown';
import * as moment from 'moment';

function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function getLogger(postfix: string): logdown.Logger {
  return logdown(`ordinem/${postfix}`, {
    logger: console,
    markdown: false,
  });
}

export {getLogger, formatDate};

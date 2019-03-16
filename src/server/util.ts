import * as moment from 'moment';

function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

export {formatDate};

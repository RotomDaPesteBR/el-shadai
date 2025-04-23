import moment from 'moment';

export function toTimeSpan(seconds: number, showMilliseconds?: boolean) {
  const date = moment.duration(seconds, 'seconds');

  return (
    `${Math.trunc(date.asHours()) > 0 ? Math.trunc(seconds / 3600) + ':' : ''}${
      Math.trunc(date.asMinutes()) > 0
        ? date.minutes().toLocaleString('pt-BR', {
            minimumIntegerDigits: 2,
            useGrouping: false
          }) + ':'
        : ''
    }${
      seconds > 0
        ? date.seconds().toLocaleString('pt-BR', {
            minimumIntegerDigits: 2,
            useGrouping: false
          })
        : date.seconds()
    }` +
    (showMilliseconds != undefined && showMilliseconds === true
      ? date.asMilliseconds() % 1000 > 0
        ? `.${date.asMilliseconds() % 1000}`
        : '.000'
      : '')
  );
}

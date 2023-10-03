import { type Formats as IntlFormat } from 'intl-messageformat';

import { type Format } from '../types';

export function convertFormatToIntlMessageFormat(
  format: Partial<Format>,
  timeZone?: string,
): Partial<IntlFormat> {
  const formatsWithTimeZone = timeZone
    ? { ...format, dateTime: getFormatWithTimeZone(format.dateTime, timeZone) }
    : format;

  return {
    ...formatsWithTimeZone,
    date: formatsWithTimeZone?.dateTime,
    time: formatsWithTimeZone?.dateTime,
  };
}

function getFormatWithTimeZone(
  dateTimeFormat: Record<string, Intl.DateTimeFormatOptions> | undefined,
  timeZone: string,
) {
  if (dateTimeFormat == null) return dateTimeFormat;

  // https://github.com/formatjs/formatjs/blob/2567b932c5d18b097a43842563046c20ce0c49f1/packages/intl/src/message.ts#L15
  return Object.keys(dateTimeFormat).reduce(
    (prev: Record<string, Intl.DateTimeFormatOptions>, curr) => {
      return {
        ...prev,
        [curr]: { timeZone, ...dateTimeFormat[curr] },
      };
    },
    {},
  );
}

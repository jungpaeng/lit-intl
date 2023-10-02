import { type Formats as IntlFormat } from 'intl-messageformat';

import { type Format } from '../types/format';

export function convertFormatToIntlMessageFormat(format: Partial<Format>): Partial<IntlFormat> {
  return {
    ...format,
    date: format?.dateTime,
    time: format?.dateTime,
  };
}

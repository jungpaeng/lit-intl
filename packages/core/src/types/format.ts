import { type NumberFormatOptions } from '@formatjs/ecma402-abstract';

export type Format = {
  number: Record<string, NumberFormatOptions>;
  dateTime: Record<string, Intl.DateTimeFormatOptions>;
};

import { type NumberFormatOptions } from '@formatjs/ecma402-abstract';

import IntlError, { IntlErrorCode, type SystemError } from './intl-error';
import { useIntlContext } from './intl.provider';

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * (365 / 12); // Approximation
const YEAR = DAY * 365;

function getRelativeTimeFormatConfig(seconds: number) {
  const absValue = Math.abs(seconds);
  let value, unit: Intl.RelativeTimeFormatUnit;

  if (absValue < MINUTE) {
    unit = 'second';
    value = Math.round(seconds);
  } else if (absValue < HOUR) {
    unit = 'minute';
    value = Math.round(seconds / MINUTE);
  } else if (absValue < DAY) {
    unit = 'hour';
    value = Math.round(seconds / HOUR);
  } else if (absValue < WEEK) {
    unit = 'day';
    value = Math.round(seconds / DAY);
  } else if (absValue < MONTH) {
    unit = 'week';
    value = Math.round(seconds / WEEK);
  } else if (absValue < YEAR) {
    unit = 'month';
    value = Math.round(seconds / MONTH);
  } else {
    unit = 'year';
    value = Math.round(seconds / YEAR);
  }

  return { value, unit };
}

export function useIntl() {
  const { formats, locale, timeZone, onError } = useIntlContext();

  function resolveFormatOrOptions<Format>(
    typeFormats: Record<string, Format> | undefined,
    formatOrOptions?: string | Format,
  ): Format | undefined {
    if (typeof formatOrOptions !== 'string') {
      return formatOrOptions;
    }

    const formatName = formatOrOptions;
    const format = typeFormats?.[formatName];

    if (format == null) {
      const error = new IntlError(
        IntlErrorCode.MISSING_FORMAT,
        process.env.NODE_ENV !== 'production'
          ? `Format \`${formatName}\` is not available. You can configure it on the provider or provide custom options.`
          : undefined,
      );

      onError(error);
      throw error;
    }

    return format;
  }

  function getFormattedValue<Value, Format>(
    value: Value,
    formatOrOptions: string | Format,
    typeFormats: Record<string, Format> | undefined,
    formatter: (format?: Format) => string,
  ) {
    let format;
    try {
      format = resolveFormatOrOptions(typeFormats, formatOrOptions);
    } catch {
      return String(value);
    }

    try {
      return formatter(format);
    } catch (_error) {
      const error = _error as SystemError;
      onError(new IntlError(IntlErrorCode.FORMATTING_ERROR, error.message));

      return String(value);
    }
  }

  function formatDateTime(
    value: number | Date,
    formatOrOptions?: string | Intl.DateTimeFormatOptions,
  ) {
    return getFormattedValue(value, formatOrOptions, formats?.dateTime, (format) => {
      if (timeZone != null && format?.timeZone == null) {
        format = { ...format, timeZone };
      }

      return new Intl.DateTimeFormat(locale, format).format(value);
    });
  }

  /**
   * @description Intl.NumberFormat를 래핑합니다.
   * @param formatOrOptions useGrouping 옵션이 들어오는 경우, undefined와 boolean 타입이 아니라면 true가 지정됩니다.
   * @param formatOrOptions signDisplay 옵션이 들어오는 경우, negative 옵션이라면 undefined가 지정됩니다.
   */
  function formatNumber(value: number | bigint, formatOrOptions?: string | NumberFormatOptions) {
    return getFormattedValue(value, formatOrOptions, formats?.number, (format) => {
      return new Intl.NumberFormat(locale, {
        ...format,
        useGrouping: format?.useGrouping == null ? undefined : !!format?.useGrouping,
        signDisplay: format?.signDisplay === 'negative' ? undefined : format?.signDisplay,
      }).format(value);
    });
  }

  function formatRelativeTime(date: number | Date, now: number | Date) {
    const dateDate = date instanceof Date ? date : new Date(date);
    const nowDate = now instanceof Date ? now : new Date(now);

    const seconds = (dateDate.getTime() - nowDate.getTime()) / 1_000;
    const { unit, value } = getRelativeTimeFormatConfig(seconds);

    try {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
    } catch (_error) {
      const error = _error as SystemError;
      onError(new IntlError(IntlErrorCode.FORMATTING_ERROR, error.message));

      return String(date);
    }
  }

  return { formatDateTime, formatNumber, formatRelativeTime };
}

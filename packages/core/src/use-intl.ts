import { useIntlContext } from './lit-intl.provider';

export function useIntl() {
  const { locale } = useIntlContext();

  function formatDateTime(value: number | Date, options?: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat(locale, options).format(value);
  }

  function formatNumber(value: number | bigint, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(locale, options).format(value);
  }

  return { formatDateTime, formatNumber };
}

import { useIntlContext } from './intl.provider';

export function useLocale() {
  return useIntlContext().locale;
}

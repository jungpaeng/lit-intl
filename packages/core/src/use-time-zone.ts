import { useIntlContext } from './intl.provider';

export function useTimeZone() {
  return useIntlContext().timeZone;
}

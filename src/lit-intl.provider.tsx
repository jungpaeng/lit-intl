import { LitIntlContext, type LitIntlContextValue } from './lit-intl.context';

type LitIntlProviderProps = React.PropsWithChildren<LitIntlContextValue>;

export function LitIntlProvider({ children, locale, message }: LitIntlProviderProps) {
  return <LitIntlContext.Provider value={{ message, locale }}>{children}</LitIntlContext.Provider>;
}

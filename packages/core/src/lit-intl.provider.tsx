import React from 'react';

import { LitIntlContext, type LitIntlContextValue } from './lit-intl.context';

type LitIntlProviderProps = React.PropsWithChildren<LitIntlContextValue>;

export function LitIntlProvider({ children, locale, message }: LitIntlProviderProps) {
  return <LitIntlContext.Provider value={{ message, locale }}>{children}</LitIntlContext.Provider>;
}

export function useIntlContext() {
  const context = React.useContext(LitIntlContext);

  if (context == null) {
    throw new Error();
  }

  return context;
}

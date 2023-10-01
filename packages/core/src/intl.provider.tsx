import React from 'react';

import { IntlContext, type IntlContextValue } from './intl.context';

type IntlProviderProps = React.PropsWithChildren<IntlContextValue>;

export function IntlProvider({ children, locale, message }: IntlProviderProps) {
  return <IntlContext.Provider value={{ message, locale }}>{children}</IntlContext.Provider>;
}

export function useIntlContext() {
  const context = React.useContext(IntlContext);

  if (context == null) {
    throw new Error();
  }

  return context;
}

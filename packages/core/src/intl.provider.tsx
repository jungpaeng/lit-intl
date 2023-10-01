import React from 'react';

import { IntlContext, type IntlContextValue } from './intl.context';

type DefaultGetMessageFallbackArgs = {
  key: string;
  namespace?: string;
};

function defaultGetMessageFallback({ key, namespace }: DefaultGetMessageFallbackArgs) {
  return `IntlError in ${[namespace, key].filter((part) => part != null).join('.')}`;
}

type IntlProviderProps = React.PropsWithChildren<
  Pick<IntlContextValue, 'message' | 'locale'> &
    Partial<Pick<IntlContextValue, 'onError' | 'getMessageFallback'>>
>;

export function IntlProvider({
  children,
  locale,
  message,
  onError = console.error,
  getMessageFallback = defaultGetMessageFallback,
}: IntlProviderProps) {
  return (
    <IntlContext.Provider value={{ message, locale, onError, getMessageFallback }}>
      {children}
    </IntlContext.Provider>
  );
}

export function useIntlContext() {
  const context = React.useContext(IntlContext);

  if (context == null) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? "[useIntlContext] Can't be called without an IntlProvider."
        : undefined,
    );
  }

  return context;
}

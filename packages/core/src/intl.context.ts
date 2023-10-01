import React from 'react';

import { type IntlMessage } from './types/intl-message';

export type IntlContextValue = {
  message: IntlMessage;
  locale?: string;
};

export const IntlContext = React.createContext<IntlContextValue | undefined>(undefined);

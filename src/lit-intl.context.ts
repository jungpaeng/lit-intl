import React from 'react';

import { type IntlMessage } from './types/intl-message';

export type LitIntlContextValue = {
  message: IntlMessage;
  locale?: string;
};

export const LitIntlContext = React.createContext<LitIntlContextValue | undefined>(undefined);

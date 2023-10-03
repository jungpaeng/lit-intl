import React from 'react';

import type IntlError from './intl-error';
import { type Format } from './types/format';
import { type IntlMessage } from './types/intl-message';
import { type RichTranslationValue } from './types/translation';

export type IntlContextValue = {
  message?: IntlMessage;
  locale: string;
  now?: Date;
  timeZone?: string;
  formats?: Partial<Format>;
  defaultTranslationValue?: RichTranslationValue;
  onError: (error: IntlError) => void;
  getMessageFallback: (info: { error: IntlError; key: string; namespace?: string }) => string;
};

export const IntlContext = React.createContext<IntlContextValue | undefined>(undefined);

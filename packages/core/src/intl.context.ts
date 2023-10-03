import React from 'react';

import type IntlError from './intl-error';
import { type AbstractIntlMessage, type Format, type RichTranslationValue } from './types';

export type IntlContextValue = {
  message?: AbstractIntlMessage;
  locale: string;
  now?: Date;
  timeZone?: string;
  formats?: Partial<Format>;
  defaultTranslationValue?: RichTranslationValue;
  onError: (error: IntlError) => void;
  getMessageFallback: (info: { error: IntlError; key: string; namespace?: string }) => string;
};

export const IntlContext = React.createContext<IntlContextValue | undefined>(undefined);

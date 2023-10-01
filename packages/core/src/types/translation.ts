import type React from 'react';

import { type PrimitiveType } from 'intl-messageformat';

export type TranslationValue = Record<
  string,
  PrimitiveType | ((children: React.ReactNode) => React.ReactNode)
>;

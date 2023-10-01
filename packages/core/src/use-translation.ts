import React from 'react';

import IntlMessageFormat from 'intl-messageformat';

import { LitIntlContext } from './lit-intl.context';
import { type IntlMessage } from './types/intl-message';
import { type TranslationValue } from './types/translation';

function resolvePath(messages: IntlMessage, idPath: string) {
  let message = messages;

  idPath.split('.').forEach((part) => {
    const next = message[part] as IntlMessage;

    if (part == null || next == null) {
      throw new Error(
        `Could not resolve \`${idPath}\` in \`${JSON.stringify(messages, null, 2)}\`.`,
      );
    }

    message = next;
  });

  return message;
}

export function useTranslation(path?: string) {
  const context = React.useContext(LitIntlContext);
  const cachedFormatByLocaleRef = React.useRef<Record<string, Record<string, IntlMessageFormat>>>(
    {},
  );

  if (context == null) {
    throw new Error();
  }

  const { message: allMessage, locale = 'not-locale' } = context;
  const intlMessage = React.useMemo(() => {
    if (path == null) return allMessage;
    return resolvePath(allMessage, path);
  }, [allMessage, path]);

  if (intlMessage == null) {
    throw new Error();
  }

  return (idPath: string, value?: TranslationValue) => {
    const cachedFormatByLocale = cachedFormatByLocaleRef.current;

    let messageFormat: IntlMessageFormat;
    if (cachedFormatByLocale[locale]?.[idPath] != null) {
      messageFormat = cachedFormatByLocale[locale][idPath];
    } else {
      const message = resolvePath(intlMessage, idPath);

      if (typeof message == 'object') {
        throw new Error();
      }

      messageFormat = new IntlMessageFormat(message, locale);
      if (!cachedFormatByLocale[locale]) {
        cachedFormatByLocale[locale] = {};
      }
      cachedFormatByLocale[locale][idPath] = messageFormat;
    }

    return messageFormat.format(value);
  };
}

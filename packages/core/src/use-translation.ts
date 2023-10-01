import React from 'react';

import IntlMessageFormat, { type Formats } from 'intl-messageformat';

import { useIntlContext } from './intl.provider';
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

function prepareTranslationValues(translationValue?: TranslationValue) {
  if (!translationValue) return translationValue;
  const transformedValues: TranslationValue = {};

  Object.keys(translationValue).forEach((key) => {
    let index = 0;
    const value = translationValue[key];

    const transformed =
      typeof value === 'function'
        ? (children: React.ReactNode) => {
            const result = value(children);

            return React.isValidElement(result)
              ? React.cloneElement(result, { key: result.key || key + index++ })
              : result;
          }
        : value;

    transformedValues[key] = transformed;
  });

  return transformedValues;
}

export function useTranslation(path?: string) {
  const context = useIntlContext();
  const cachedFormatByLocaleRef = React.useRef<Record<string, Record<string, IntlMessageFormat>>>(
    {},
  );

  const { message: allMessage, locale = 'not-locale' } = context;
  const intlMessage = React.useMemo(() => {
    if (path == null) return allMessage;
    return resolvePath(allMessage, path);
  }, [allMessage, path]);

  if (intlMessage == null) {
    throw new Error();
  }

  return (idPath: string, value?: TranslationValue, format?: Partial<Formats>) => {
    const cachedFormatByLocale = cachedFormatByLocaleRef.current;

    let messageFormat: IntlMessageFormat;
    if (cachedFormatByLocale[locale]?.[idPath] != null) {
      messageFormat = cachedFormatByLocale[locale][idPath];
    } else {
      const message = resolvePath(intlMessage, idPath);

      if (typeof message == 'object') {
        throw new Error();
      }

      messageFormat = new IntlMessageFormat(message, locale, format);
      if (!cachedFormatByLocale[locale]) {
        cachedFormatByLocale[locale] = {};
      }
      cachedFormatByLocale[locale][idPath] = messageFormat;
    }

    return messageFormat.format(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore It's working fine, but formatJS can't get a type for richText and is throwing an error.
      prepareTranslationValues(value),
    );
  };
}

import React from 'react';

import IntlMessageFormat, { type Formats } from 'intl-messageformat';

import IntlError, { IntlErrorCode, type SystemError } from './intl-error';
import { useIntlContext } from './intl.provider';
import { type IntlMessage } from './types/intl-message';
import { type TranslationValue } from './types/translation';
import { convertFormatToIntlMessageFormat } from './utils/convert-format-to-intl-message-format';

/**
 * @description json 파일 내에서 특정 key에 해당하는 값을 반환합니다.
 * @description namespace를 전달함으로서 에러가 발생했을 때 부모의 key를 명시할 수 있습니다.
 */
function resolvePath(messages: IntlMessage | undefined, idPath: string, namespace?: string) {
  if (messages == null) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `No messages available at \`${namespace}\`.`
        : undefined,
    );
  }

  let message = messages;

  idPath.split('.').forEach((part) => {
    const next = message[part] as IntlMessage;

    if (part == null || next == null) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Could not resolve \`${idPath}\` in ${namespace ? `\`${namespace}\`` : 'messages'}.`
          : undefined,
      );
    }

    message = next;
  });

  return message;
}

/**
 * @description format value로 함수가 들어갔을 때 React.Component의 형태로 변환합니다.
 */
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

            // key 중복을 피하기 위해 cloneElement 이후 key를 직접 주입합니다.
            return React.isValidElement(result)
              ? React.cloneElement(result, { key: result.key || key + index++ })
              : result;
          }
        : value;

    transformedValues[key] = transformed;
  });

  return transformedValues;
}

export function useTranslation(namespace?: string) {
  const {
    message: allMessage,
    locale,
    formats: globalFormats,
    timeZone,
    onError,
    getMessageFallback,
  } = useIntlContext();
  const cachedFormatByLocaleRef = React.useRef<Record<string, Record<string, IntlMessageFormat>>>(
    {},
  );

  /**
   * @description 처음 전달받은 message로부터 namespace 내부의 값을 조회합니다.
   * @description namespace 내부의 값을 조회할 수 없다면 에러를 반환합니다.
   */
  const messageOrError = React.useMemo(() => {
    try {
      const retrievedMessages = namespace ? resolvePath(allMessage, namespace) : allMessage;

      if (retrievedMessages == null) {
        throw new Error(
          process.env.NODE_ENV !== 'production'
            ? `No messages for namespace \`${namespace}\`found`
            : undefined,
        );
      }

      return retrievedMessages;
    } catch (_error) {
      const error = _error as SystemError;
      const intlError = new IntlError(IntlErrorCode.MISSING_MESSAGE, error.message);
      onError(intlError);

      return intlError;
    }
  }, [allMessage, onError, namespace]);

  return React.useCallback(
    (
      key: string,
      value?: TranslationValue & { __rawValue?: boolean },
      format?: Partial<Formats>,
    ) => {
      const cachedFormatByLocale = cachedFormatByLocaleRef.current;

      if (messageOrError instanceof IntlError) {
        return getMessageFallback({ error: messageOrError, key, namespace });
      }

      function getFallbackFromError(code: IntlErrorCode, message?: string) {
        const error = new IntlError(code, message);
        onError(error);

        return getMessageFallback({ error, key, namespace });
      }

      const intlMessage = messageOrError;
      let messageFormat: IntlMessageFormat;

      if (cachedFormatByLocale[locale]?.[key] != null) {
        // 캐시되어있다면 해당 messageFormat 메시지를 반환합니다.
        messageFormat = cachedFormatByLocale[locale][key];
      } else {
        let message;

        try {
          // key 값에 대응하는 value(message)를 조회합니다.
          message = resolvePath(intlMessage, key, namespace);
        } catch (_error) {
          const error = _error as SystemError;
          return getFallbackFromError(IntlErrorCode.MISSING_MESSAGE, error.message);
        }

        // 조회된 message는 object 타입일 수 없습니다.
        if (typeof message == 'object') {
          return getFallbackFromError(
            IntlErrorCode.INSUFFICIENT_PATH,
            process.env.NODE_ENV !== 'production'
              ? `Insufficient path specified for \`${key}\` in \`${namespace}\``
              : undefined,
          );
        }

        if (value?.__rawValue === true) {
          return message;
        }

        try {
          // IntlMessageFormat을 실행시키며, 실패시 INVALID_MESSAGE를 반환합니다.
          messageFormat = new IntlMessageFormat(
            message,
            locale,
            convertFormatToIntlMessageFormat({ ...globalFormats, ...format }, timeZone),
          );
        } catch (_error) {
          const error = _error as SystemError;
          return getFallbackFromError(IntlErrorCode.INVALID_MESSAGE, error.message);
        }

        if (!cachedFormatByLocale[locale]) {
          cachedFormatByLocale[locale] = {};
        }
        cachedFormatByLocale[locale][key] = messageFormat;
      }

      try {
        const formattedMessage = messageFormat.format(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore It's working fine, but formatJS can't get a type for richText and is throwing an error.
          prepareTranslationValues(value),
        );

        if (formattedMessage == null) {
          throw new Error(
            process.env.NODE_ENV !== 'production'
              ? `Unable to format ${[namespace, key].join('.')}`
              : undefined,
          );
        }

        return React.isValidElement(formattedMessage) ||
          Array.isArray(formattedMessage) ||
          typeof formattedMessage === 'string'
          ? formattedMessage
          : String(formattedMessage);
      } catch (_error) {
        const error = _error as SystemError;
        return getFallbackFromError(IntlErrorCode.FORMATTING_ERROR, error.message);
      }
    },
    [getMessageFallback, globalFormats, locale, messageOrError, namespace, onError, timeZone],
  );
}

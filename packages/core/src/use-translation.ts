import IntlError, { IntlErrorCode } from './intl-error';
import { useIntlContext } from './intl.provider';
import { type RichTranslationValue, type Format, type TranslationValue } from './types';
import { useTranslationImpl } from './use-translationImpl';
import { type MessageKey } from './utils/message-key';
import { type NamespaceKey } from './utils/namespace-key';
import { type NestedKeyOf } from './utils/nested-key-of';
import { type NestedValueOf } from './utils/nested-value-of';

export function useTranslation<
  NestedKey extends NamespaceKey<IntlMessage, NestedKeyOf<IntlMessage>>,
>(
  namespace?: NestedKey,
): {
  // default translate function return type
  <
    TargetKey extends MessageKey<
      NestedValueOf<{ '!': IntlMessage }, [NestedKey] extends [never] ? '!' : `!.${NestedKey}`>,
      NestedKeyOf<
        NestedValueOf<{ '!': IntlMessage }, [NestedKey] extends [never] ? '!' : `!.${NestedKey}`>
      >
    >,
  >(
    key: TargetKey,
    values?: TranslationValue,
    formats?: Partial<Format>,
  ): string;

  // translate.rich function return type
  rich<
    TargetKey extends MessageKey<
      NestedValueOf<{ '!': IntlMessage }, [NestedKey] extends [never] ? '!' : `!.${NestedKey}`>,
      NestedKeyOf<
        NestedValueOf<{ '!': IntlMessage }, [NestedKey] extends [never] ? '!' : `!.${NestedKey}`>
      >
    >,
  >(
    key: TargetKey,
    values?: RichTranslationValue,
    format?: Partial<Format>,
  ): string | React.ReactElement | React.ReactNode[];

  // translate.raw function return type
  raw<
    TargetKey extends MessageKey<
      NestedValueOf<{ '!': IntlMessage }, [NestedKey] extends [never] ? '!' : `!.${NestedKey}`>,
      NestedKeyOf<
        NestedValueOf<{ '!': IntlMessage }, [NestedKey] extends [never] ? '!' : `!.${NestedKey}`>
      >
    >,
  >(
    key: TargetKey,
    values?: RichTranslationValue,
    format?: Partial<Format>,
  ): any;
} {
  const { message: intlMessage, onError } = useIntlContext();
  const message = intlMessage as IntlMessage;

  if (message == null) {
    const intlError = new IntlError(
      IntlErrorCode.MISSING_MESSAGE,
      process.env.NODE_ENV !== 'production'
        ? `No messages were configured on the provider.`
        : undefined,
    );
    onError(intlError);
    throw intlError;
  }

  return useTranslationImpl<
    { '!': IntlMessage },
    [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
  >(
    { '!': message },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    namespace ? `!.${namespace}` : '!',
    '!',
  );
}

import React from 'react';

import { getByText, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import IntlError, { IntlErrorCode } from '../src/intl-error';
import { IntlProvider } from '../src/intl.provider';
import { type Format } from '../src/types/format';
import { type RichTranslationValue, type TranslationValue } from '../src/types/translation';
import { useTranslation } from '../src/use-translation';

// Bypass import lint rule ...
new IntlError(IntlErrorCode.MISSING_MESSAGE, '');

function renderMessage(message: string, values?: TranslationValue, format?: Partial<Format>) {
  function Component() {
    const t = useTranslation();
    return <>{t('message', values, format)}</>;
  }

  return render(
    <IntlProvider message={{ message }} locale="en" timeZone="Asia/Seoul">
      <Component />
    </IntlProvider>,
  );
}

describe('use-translation', () => {
  it('should be print Hello', () => {
    renderMessage('Hello');
    screen.getByText('Hello');
  });

  it('should be print Hello with name value', () => {
    renderMessage('Hello {name}', { name: 'world' });
    screen.getByText('Hello world');
  });

  it('should be print number currency format', () => {
    renderMessage(
      '{price, number, currency}',
      { price: 400 },
      {
        number: {
          currency: { style: 'currency', currency: 'EUR' },
        },
      },
    );
    screen.getByText('€400.00');
  });

  it('should be print number percent format', () => {
    renderMessage('Almost {pctBlack, number, ::percent} of them are black.', { pctBlack: 0.4 });
    screen.getByText('Almost 40% of them are black.');
  });

  it('should be print date format', () => {
    renderMessage('Sale begins {start, date, medium}', { start: new Date('2023-10-01') });
    screen.getByText('Sale begins Oct 1, 2023');
  });

  it('should be print time format', () => {
    renderMessage('Coupon expires at {expires, time, short}', { expires: new Date('2023-10-01') });
    screen.getByText('Coupon expires at 9:00 AM');
  });

  it('should be print time with timezone', () => {
    renderMessage(
      'Coupon expires at {expires, time, time}',
      { expires: new Date('2023-10-01') },
      { dateTime: { time: { hour: 'numeric', minute: '2-digit' } } },
    );
    screen.getByText('Coupon expires at 9:00 AM');
  });

  it('should be print select format', () => {
    renderMessage('{ gender, select, male {He} female {She} other {They} } will respond shortly.', {
      gender: 'male',
    });
    screen.getByText('He will respond shortly.');
  });

  it('should be print nestedSelect format', () => {
    renderMessage(
      '{ taxableArea, select, yes {An additional {taxRate, number, percent} tax will be collected.} other {No taxes apply.} }',
      { taxableArea: 'yes', taxRate: 0.1 },
    );
    screen.getByText('An additional 10% tax will be collected.');
  });

  it('should be print plural format', () => {
    renderMessage('Cart: {itemCount} {itemCount, plural, one {item} other {items} }', {
      itemCount: 1,
    });
    screen.getByText('Cart: 1 item');
  });

  it('should be print selectordinal format', () => {
    renderMessage(
      "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
      { year: 1 },
    );
    screen.getByText("It's my cat's 1st birthday!");
  });
});

it('has a stable reference', () => {
  let existingT: any;

  function Component({ count }: { count: number }) {
    const t = useTranslation();

    if (existingT) {
      expect(t).toBe(existingT);
    } else {
      existingT = t;
    }

    return <>{count}</>;
  }

  const messages = {};

  const { rerender } = render(
    <IntlProvider locale="en" message={messages}>
      <Component count={1} />
    </IntlProvider>,
  );
  screen.getByText('1');

  rerender(
    <IntlProvider locale="en" message={messages}>
      <Component count={2} />
    </IntlProvider>,
  );
  screen.getByText('2');
});

describe('t.raw', () => {
  function renderRawMessage<Message extends string | IntlMessage>(
    message: Message,
    callback: (message: Message) => React.ReactNode,
  ) {
    function Component() {
      const t = useTranslation();
      return <>{callback(t.raw('message') as Message)}</>;
    }

    return render(
      <IntlProvider message={{ message }} locale="en">
        <Component />
      </IntlProvider>,
    );
  }

  it('can return raw messages without processing them', () => {
    const { container } = renderRawMessage('<a href="/test">Test</a><p>{hello}</p>', (message) => (
      <span dangerouslySetInnerHTML={{ __html: message }} />
    ));

    expect(container.innerHTML).toBe('<span><a href="/test">Test</a><p>{hello}</p></span>');
  });

  it('can return object', () => {
    const { container } = renderRawMessage({ A: { AA: 'A.AA' } }, (message) => (
      <span>{message.A.AA}</span>
    ));

    expect(container.innerHTML).toBe('<span>A.AA</span>');
  });

  it("returns an error when looking up a key that doesn't exist", () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslation();
      return <>{t.raw('bar')}</>;
    }

    render(
      <IntlProvider message={{ foo: 'foo' }} locale="en" onError={onError}>
        <Component />
      </IntlProvider>,
    );

    expect(onError).toHaveBeenCalled();
    screen.getByText('IntlError in bar');
  });
});

it('renders the correct message when the namespace changes', () => {
  function Component({ namespace }: { namespace: string }): JSX.Element {
    const t = useTranslation(namespace);

    return <span>{t('title')}</span>;
  }

  const messages = {
    namespaceA: { title: 'This is namespace A' },
    namespaceB: { title: 'This is namespace B' },
  };

  const { rerender } = render(
    <IntlProvider locale="en" message={messages}>
      <Component namespace="namespaceA" />
    </IntlProvider>,
  );
  screen.getByText('This is namespace A');

  rerender(
    <IntlProvider locale="en" message={messages}>
      <Component namespace="namespaceB" />
    </IntlProvider>,
  );
  screen.getByText('This is namespace B');
});

it('renders the correct message when the message changes', async () => {
  const koMessages = {
    Test: { title: '테스트 제목' },
  };
  const enMessages = {
    Test: { title: 'Test Title' },
  };

  function Component({ namespace }: { namespace: string }): JSX.Element {
    const t = useTranslation(namespace);
    return <span>{t('title')}</span>;
  }
  function Provider() {
    const [locale, setLocale] = React.useState('ko');
    const [message, setMessage] = React.useState(koMessages);

    React.useEffect(() => {
      setMessage(locale === 'ko' ? koMessages : enMessages);
    }, [locale]);

    return (
      <IntlProvider locale={locale} message={message}>
        <button
          onClick={() => {
            setLocale((prev) => (prev === 'ko' ? 'en' : 'ko'));
          }}
        >
          CHANGE LOCALE BUTTON
        </button>
        <p>CURRENT LOCALE: {locale}</p>
        <Component namespace="Test" />
      </IntlProvider>
    );
  }

  const { container } = render(<Provider />);
  screen.getByText('CURRENT LOCALE: ko');
  screen.getByText('테스트 제목');

  const buttonElement = getByText(container, 'CHANGE LOCALE BUTTON');
  userEvent.click(buttonElement);
  await waitFor(() => {
    screen.getByText('CURRENT LOCALE: en');
    screen.getByText('Test Title');
  });

  userEvent.click(buttonElement);
  await waitFor(() => {
    screen.getByText('CURRENT LOCALE: ko');
    screen.getByText('테스트 제목');
  });
});

describe('t.rich', () => {
  function renderRichMessage(
    message: string | IntlMessage,
    value?: RichTranslationValue,
    format?: Partial<Format>,
  ) {
    function Component() {
      const t = useTranslation();
      return <>{t.rich('message', value, format)}</>;
    }

    return render(
      <IntlProvider message={{ message }} locale="en">
        <Component />
      </IntlProvider>,
    );
  }
  it('should be print rich text', () => {
    const { container } = renderRichMessage(
      'Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis> with <link>{pct, number, ::percent} discount</link>',
      {
        boldThis: (children: React.ReactNode) => <b>{children}</b>,
        link: (children: React.ReactNode) => <i>{children}</i>,
        price: 10000,
        pct: 0.1,
      },
    );

    expect(container.innerHTML).toBe('Our price is <b>$10,000</b> with <i>10% discount</i>');
  });
});

describe('error handling', () => {
  it('throw when no messages are configured', () => {
    const onError = vi.fn();
    const originalConsoleError = console.error;
    console.error = vi.fn();

    function Component() {
      const t = useTranslation('Component');
      return <>{t('label')}</>;
    }

    expect(() =>
      render(
        <IntlProvider locale="en" onError={onError}>
          <Component />
        </IntlProvider>,
      ),
    ).toThrow('MISSING_MESSAGE: No messages were configured on the provider.');

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe('MISSING_MESSAGE: No messages were configured on the provider.');
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);

    console.error = originalConsoleError;
  });

  it('allows to configure a fallback', () => {
    const onError = vi.fn();

    function Component() {
      const t = useTranslation('Component');
      return <>{t('label')}</>;
    }

    render(
      <IntlProvider
        message={{}}
        locale="en"
        onError={onError}
        getMessageFallback={() => 'fallback'}
      >
        <Component />
      </IntlProvider>,
    );

    expect(onError).toHaveBeenCalled();
    screen.getByText('fallback');
  });

  it('handles unavailable namespaces', () => {
    const onError = vi.fn();
    function Component() {
      const t = useTranslation('Component');
      return <>{t('label')}</>;
    }

    render(
      <IntlProvider locale="en" message={{}} onError={onError}>
        <Component />
      </IntlProvider>,
    );

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe('MISSING_MESSAGE: Could not resolve `Component` in messages.');
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    screen.getByText('IntlError in Component.label');
  });

  it('handles unavailable messages within an existing namespace', () => {
    const onError = vi.fn();
    function Component() {
      const t = useTranslation('Component');
      return <>{t('label')}</>;
    }
    render(
      <IntlProvider locale="en" message={{ Component: {} }} onError={onError}>
        <Component />
      </IntlProvider>,
    );
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe('MISSING_MESSAGE: Could not resolve `label` in `Component`.');
    expect(error.code).toBe(IntlErrorCode.MISSING_MESSAGE);
    screen.getByText('IntlError in Component.label');
  });

  it('handles unparseable messages', () => {
    const onError = vi.fn();
    function Component() {
      const t = useTranslation();
      return <>{t('price', { value: 10 })}</>;
    }

    render(
      <IntlProvider locale="en" message={{ price: '{value, currency}' }} onError={onError}>
        <Component />
      </IntlProvider>,
    );
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe('INVALID_MESSAGE: INVALID_ARGUMENT_TYPE');
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    screen.getByText('IntlError in price');
  });

  it('handles formatting errors', () => {
    const onError = vi.fn();
    function Component() {
      const t = useTranslation();
      return <>{t('price')}</>;
    }

    render(
      <IntlProvider locale="en" message={{ price: '{value}' }} onError={onError}>
        <Component />
      </IntlProvider>,
    );
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'FORMATTING_ERROR: The intl string context variable "value" was not provided to the string "{value}"',
    );
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
    screen.getByText('IntlError in price');
  });

  it('handles rich text from translation function', () => {
    const onError = vi.fn();
    function Component() {
      const t = useTranslation();
      return (
        <>
          {t('rich', {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            boldThis: (children: React.ReactNode) => <b>{children}</b>,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            link: (children: React.ReactNode) => <i>{children}</i>,
            price: 10000,
            pct: 0.1,
          })}
        </>
      );
    }

    render(
      <IntlProvider
        locale="en"
        message={{
          rich: 'Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis> with <link>{pct, number, ::percent} discount</link>',
        }}
        onError={onError}
      >
        <Component />
      </IntlProvider>,
    );
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.INVALID_MESSAGE);
    expect(error.message).toBe(
      "INVALID_MESSAGE: The message `rich` in message didn't resolve to a string. If you want to format rich text, use `t.rich` instead.",
    );
    screen.getByText('IntlError in rich');
  });
});

describe('global formats', () => {
  function renderDate(
    message: string,
    globalFormats?: Partial<Format>,
    overrideFormats?: Partial<Format>,
  ) {
    function Component() {
      const t = useTranslation();
      const date = new Date('2020-11-19T15:38:43.700Z');
      return <>{t('date', { value: date }, overrideFormats)}</>;
    }

    render(
      <IntlProvider formats={globalFormats} locale="en" message={{ date: message }}>
        <Component />
      </IntlProvider>,
    );
  }

  it('allows to add global formats', () => {
    renderDate('{value, date, onlyYear}', {
      dateTime: { onlyYear: { year: 'numeric' } },
    });

    screen.getByText('2020');
  });

  it('can modify existing global formats', () => {
    renderDate('{value, date, full}', {
      dateTime: {
        full: { weekday: undefined },
      },
    });

    screen.getByText('November 20, 2020');
  });

  it('allows to override global formats locally', () => {
    renderDate(
      '{value, date, full}',
      { dateTime: { full: { weekday: undefined } } },
      { dateTime: { full: { weekday: 'long' } } },
    );

    screen.getByText('Friday, November 20, 2020');
  });
});

describe('default rich translation value', () => {
  function renderRichTextMessageWithDefault(
    message: string,
    value?: TranslationValue,
    format?: Partial<Format>,
  ) {
    function Component() {
      const t = useTranslation();
      return <>{t('message', value, format)}</>;
    }

    return render(
      <IntlProvider locale="en" message={{ message }} defaultTranslationValue={{ value: 'VALUE!' }}>
        <Component />
      </IntlProvider>,
    );
  }

  it('uses default rich text element', () => {
    const { container } = renderRichTextMessageWithDefault('Hello {value}');
    expect(container.innerHTML).toBe('Hello VALUE!');
  });
});

describe('default rich translation value', () => {
  function renderRichTextMessageWithDefault(
    message: string,
    value?: RichTranslationValue,
    format?: Partial<Format>,
  ) {
    function Component() {
      const t = useTranslation();
      return <>{t.rich('message', value, format)}</>;
    }

    return render(
      <IntlProvider
        locale="en"
        message={{ message }}
        defaultTranslationValue={{
          important: (children) => <b>{children}</b>,
        }}
      >
        <Component />
      </IntlProvider>,
    );
  }

  it('uses default rich text element', () => {
    const { container } = renderRichTextMessageWithDefault(
      'This is <important>important</important> and <important>this as well</important>',
    );
    expect(container.innerHTML).toBe('This is <b>important</b> and <b>this as well</b>');
  });
});

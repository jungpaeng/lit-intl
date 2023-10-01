import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { LitIntlProvider } from '../src/lit-intl.provider';
import { type IntlMessage } from '../src/types/intl-message';
import { type TranslationValue } from '../src/types/translation';
import { useTranslation } from '../src/use-translation';

const message: IntlMessage = {
  Basic: {
    // https://formatjs.io/docs/core-concepts/icu-syntax/#basic-principles
    static: 'Hello',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#simple-argument
    simpleArgument: 'Hello {name}',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#number-type
    currency: '{price, number, ::currency/EUR}',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#number-type
    percent: 'Almost {pctBlack, number, ::percent} of them are black.',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#date-type
    date: 'Sale begins {start, date, medium}',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#time-type
    time: 'Coupon expires at {expires, time, short}',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#select-format
    select: '{ gender, select, male {He} female {She} other {They} } will respond shortly.',

    nestedSelect:
      '{ taxableArea, select, yes {An additional {taxRate, number, percent} tax will be collected.} other {No taxes apply.} }',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#plural-format
    plural: 'Cart: {itemCount} {itemCount, plural, one {item} other {items} }',

    // https://formatjs.io/docs/core-concepts/icu-syntax/#selectordinal-format
    selectordinal:
      "It's my cat's {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",

    // https://formatjs.io/docs/core-concepts/icu-syntax/#rich-text-formatting
    // https://formatjs.io/docs/intl-messageformat/#rich-text-support
    richText:
      'Our price is <boldThis>{price, number, ::currency/USD precision-integer}</boldThis> with <link>{pct, number, ::percent} discount</link>',
  },
};

function Provider({ children }: React.PropsWithChildren) {
  return <LitIntlProvider message={message}>{children}</LitIntlProvider>;
}

function renderMessage(message: string, values?: TranslationValue) {
  function Component() {
    const t = useTranslation('Basic');
    return <>{t(message, values)}</>;
  }

  return render(
    <Provider>
      <Component />
    </Provider>,
  );
}

it('should be print Hello', () => {
  renderMessage('static');
  screen.getByText('Hello');
});

it('should be print Hello with name value', () => {
  renderMessage('simpleArgument', { name: 'world' });
  screen.getByText('Hello world');
});

it('should be print number currency format', () => {
  renderMessage('currency', { price: 400 });
  screen.getByText('€400.00');
});

it('should be print number percent format', () => {
  renderMessage('percent', { pctBlack: 0.4 });
  screen.getByText('Almost 40% of them are black.');
});

it('should be print date format', () => {
  renderMessage('date', { start: new Date('2023-10-01') });
  screen.getByText('Sale begins Oct 1, 2023');
});

it('should be print time format', () => {
  renderMessage('time', { expires: new Date('2023-10-01') });
  screen.getByText('Coupon expires at 9:00 AM');
});

it('should be print select format', () => {
  renderMessage('select', { gender: 'male' });
  screen.getByText('He will respond shortly.');
});

it('should be print nestedSelect format', () => {
  renderMessage('nestedSelect', { taxableArea: 'yes', taxRate: 0.1 });
  screen.getByText('An additional 10% tax will be collected.');
});

it('should be print plural format', () => {
  renderMessage('plural', { itemCount: 1 });
  screen.getByText('Cart: 1 item');
});

it('should be print selectordinal format', () => {
  renderMessage('selectordinal', { year: 1 });
  screen.getByText("It's my cat's 1st birthday!");
});

it('should be print rich text', () => {
  const { container } = renderMessage('richText', {
    boldThis: (children: React.ReactNode) => <b>{children}</b>,
    link: (children: React.ReactNode) => <i>{children}</i>,
    price: 10000,
    pct: 0.1,
  });

  expect(container.innerHTML).toBe('Our price is <b>$10,000</b> with <i>10% discount</i>');
});

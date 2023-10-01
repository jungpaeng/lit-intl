import { render, screen } from '@testing-library/react';
import { type Formats } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';

import { LitIntlProvider } from '../src/lit-intl.provider';
import { type TranslationValue } from '../src/types/translation';
import { useTranslation } from '../src/use-translation';

function renderMessage(message: string, values?: TranslationValue, format?: Partial<Formats>) {
  function Component() {
    const t = useTranslation();
    return <>{t('message', values, format)}</>;
  }

  return render(
    <LitIntlProvider message={{ message }}>
      <Component />
    </LitIntlProvider>,
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

  it('should be print rich text', () => {
    const { container } = renderMessage(
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

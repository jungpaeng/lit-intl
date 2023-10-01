import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

import { LitIntlProvider } from '../src/lit-intl.provider';
import { useIntl } from '../src/use-intl';

describe('formatDate', () => {
  const mockDate = new Date('2023-10-01T14:33:26.079Z');

  function renderDateTime(value: Date | number, options?: Intl.DateTimeFormatOptions) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatDateTime(value, options)}</>;
    }

    render(
      <LitIntlProvider message={{}}>
        <Component />
      </LitIntlProvider>,
    );
  }

  it('formats a date', () => {
    renderDateTime(mockDate);
    screen.getByText('10/1/2023');
  });

  it('accepts options', () => {
    renderDateTime(mockDate, { month: 'long' });
    screen.getByText('October');
  });

  it('formats time', () => {
    renderDateTime(mockDate, { hour: 'numeric', minute: 'numeric' });
    screen.getByText('11:33 PM');
  });
});

describe('formatNumber', () => {
  function renderNumber(value: number, options?: Intl.NumberFormatOptions) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatNumber(value, options)}</>;
    }

    render(
      <LitIntlProvider message={{}}>
        <Component />
      </LitIntlProvider>,
    );
  }

  it('formats a number', () => {
    renderNumber(2948192329.12312);
    screen.getByText('2,948,192,329.123');
  });

  it('accepts options', () => {
    renderNumber(299.99, { currency: 'EUR', style: 'currency' });
    screen.getByText('€299.99');
  });
});

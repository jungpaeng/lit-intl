import { type NumberFormatOptions } from '@formatjs/ecma402-abstract';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import IntlError, { IntlErrorCode } from '../src/intl-error';
import { IntlProvider } from '../src/intl.provider';
import { useIntl } from '../src/use-intl';

// Bypass import lint rule ...
new IntlError(IntlErrorCode.MISSING_MESSAGE, '');

describe('formatDateTime', () => {
  const mockDate = new Date('2023-10-01T14:33:26.079Z');

  function renderDateTime(value: Date | number, options?: Intl.DateTimeFormatOptions) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatDateTime(value, options)}</>;
    }

    render(
      <IntlProvider message={{}} locale="en">
        <Component />
      </IntlProvider>,
    );
  }

  it('formats a date', () => {
    renderDateTime(mockDate);
    screen.getByText('10/1/2023');
  });

  it('formats a time', () => {
    renderDateTime(mockDate, { hour: 'numeric', minute: 'numeric' });
    screen.getByText('11:33 PM');
  });

  it('accepts options', () => {
    renderDateTime(mockDate, { month: 'long' });
    screen.getByText('October');
  });

  it('can use a global date format', () => {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatDateTime(mockDate, 'onlyYear')}</>;
    }

    render(
      <IntlProvider
        formats={{ dateTime: { onlyYear: { year: 'numeric' } } }}
        message={{}}
        locale={'en'}
      >
        <Component />
      </IntlProvider>,
    );

    screen.getByText('2023');
  });

  it('can use a global time format', () => {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatDateTime(mockDate, 'onlyHours')}</>;
    }

    render(
      <IntlProvider
        formats={{ dateTime: { onlyHours: { hour: 'numeric' } } }}
        message={{}}
        locale={'en'}
      >
        <Component />
      </IntlProvider>,
    );

    screen.getByText('11 PM');
  });

  describe('error handling', () => {
    it('handles missing formats', () => {
      const onError = vi.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatDateTime(mockDate, 'onlyYear')}</>;
      }

      const { container } = render(
        <IntlProvider onError={onError} message={{}} locale={'en'}>
          <Component />
        </IntlProvider>,
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'MISSING_FORMAT: Format `onlyYear` is not available. You can configure it on the provider or provide custom options.',
      );
      expect(error.code).toBe(IntlErrorCode.MISSING_FORMAT);
      expect(container.textContent).toMatch(/Oct 01 2023/);
    });

    it('handles formatting errors', () => {
      const onError = vi.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatDateTime(mockDate, { year: 'very long' as any })}</>;
      }

      const { container } = render(
        <IntlProvider onError={onError} message={{}} locale={'en'}>
          <Component />
        </IntlProvider>,
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(error.message).toBe(
        'FORMATTING_ERROR: Value very long out of range for Intl.DateTimeFormat options property year',
      );
      expect(container.textContent).toMatch(/Oct 01 2023/);
    });
  });
});

describe('formatNumber', () => {
  function renderNumber(value: number, options?: NumberFormatOptions) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatNumber(value, options)}</>;
    }

    render(
      <IntlProvider message={{}} locale="en">
        <Component />
      </IntlProvider>,
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

  it('can use a global format', () => {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatNumber(10000, 'noGrouping')}</>;
    }

    render(
      <IntlProvider
        formats={{ number: { noGrouping: { useGrouping: false } } }}
        message={{}}
        locale={'en'}
      >
        <Component />
      </IntlProvider>,
    );

    screen.getByText('10000');
  });

  describe('error handling', () => {
    const mockNumber = 10000;

    it('handles missing formats', () => {
      const onError = vi.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatNumber(mockNumber, 'missing')}</>;
      }

      const { container } = render(
        <IntlProvider onError={onError} message={{}} locale={'en'}>
          <Component />
        </IntlProvider>,
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'MISSING_FORMAT: Format `missing` is not available. You can configure it on the provider or provide custom options.',
      );
      expect(error.code).toBe(IntlErrorCode.MISSING_FORMAT);
      expect(container.textContent).toBe('10000');
    });

    it('handles formatting errors', () => {
      const onError = vi.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatNumber(mockNumber, { currency: 'unknown' })}</>;
      }

      const { container } = render(
        <IntlProvider onError={onError} message={{}} locale={'en'}>
          <Component />
        </IntlProvider>,
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(error.message).toBe('FORMATTING_ERROR: Invalid currency code : unknown');
      expect(container.textContent).toBe('10000');
    });
  });
});

describe('formatRelativeTime', () => {
  function renderNumber(date: Date | number, now: Date | number) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatRelativeTime(date, now)}</>;
    }

    render(
      <IntlProvider message={{}} locale="en">
        <Component />
      </IntlProvider>,
    );
  }

  it('can format now', () => {
    renderNumber(new Date('2020-11-20T10:36:00.000Z'), new Date('2020-11-20T10:36:00.100Z'));
    screen.getByText('now');
  });

  it('can format seconds', () => {
    renderNumber(new Date('2020-11-20T10:35:31.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('29 seconds ago');
  });

  it('can format minutes', () => {
    renderNumber(new Date('2020-11-20T10:12:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('24 minutes ago');
  });

  it('uses the lowest unit possible', () => {
    renderNumber(new Date('2020-11-20T09:37:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('59 minutes ago');
  });

  it('can format hours', () => {
    renderNumber(new Date('2020-11-20T08:30:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('2 hours ago');
  });

  it('can format days', () => {
    renderNumber(new Date('2020-11-17T10:36:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('3 days ago');
  });

  it('can format weeks', () => {
    renderNumber(new Date('2020-11-02T10:36:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('3 weeks ago');
  });

  it('can format months', () => {
    renderNumber(new Date('2020-03-02T10:36:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('9 months ago');
  });

  it('can format years', () => {
    renderNumber(new Date('1984-11-20T10:36:00.000Z'), new Date('2020-11-20T10:36:00.000Z'));
    screen.getByText('36 years ago');
  });

  describe('error handling', () => {
    it('handles formatting errors', () => {
      const onError = vi.fn();

      function Component() {
        const intl = useIntl();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const date = 'not a number' as number;
        return <>{intl.formatRelativeTime(date, -20)}</>;
      }

      const { container } = render(
        <IntlProvider onError={onError} message={{}} locale={'en'}>
          <Component />
        </IntlProvider>,
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(error.message).toBe(
        'FORMATTING_ERROR: Value need to be finite number for Intl.RelativeTimeFormat.prototype.format()',
      );
      expect(container.textContent).toBe('not a number');
    });
  });
});

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { useTimeZone } from '../src';
import { IntlProvider } from '../src/intl.provider';

it('returns the provider time zone', () => {
  function Component() {
    return <p>{useTimeZone()}</p>;
  }

  render(
    <IntlProvider locale="en" timeZone="Asia/Seoul">
      <Component />
    </IntlProvider>,
  );
  screen.getByText('Asia/Seoul');
});

it('returns undefined when no time zone in provider', () => {
  function Component() {
    return <p>{useTimeZone()}</p>;
  }

  const { container } = render(
    <IntlProvider locale="en">
      <Component />
    </IntlProvider>,
  );
  expect(container.textContent).toBe('');
});

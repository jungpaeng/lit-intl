import { render, screen } from '@testing-library/react';
import { it } from 'vitest';

import { IntlProvider } from '../src/intl.provider';
import { useLocale } from '../src/use-locale';

it('returns the provider locale', () => {
  function Component() {
    return <p>{useLocale()}</p>;
  }

  render(
    <IntlProvider locale="en">
      <Component />
    </IntlProvider>,
  );
  screen.getByText('en');
});

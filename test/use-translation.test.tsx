import { LitIntlProvider } from '../src/lit-intl.provider';
import { type IntlMessage } from '../src/types/intl-message';
import { type TranslationValue } from '../src/types/translation';
import { useTranslation } from '../src/use-translation';

import { render, screen } from '@testing-library/react';
import { it } from 'vitest';

const message: IntlMessage = {
  Basic: {
    Hello: 'Hello',
    'Hello {name}': 'Hello {name}',
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
  renderMessage('Hello');
  screen.getByText('Hello');
});

it('should be print Hello with name value', () => {
  renderMessage('Hello {name}', { name: 'world' });
  screen.getByText('Hello world');
});

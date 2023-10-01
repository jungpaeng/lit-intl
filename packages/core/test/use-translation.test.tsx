import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { LitIntlProvider } from '../src/lit-intl.provider';
import { type IntlMessage } from '../src/types/intl-message';
import { type TranslationValue } from '../src/types/translation';
import { useTranslation } from '../src/use-translation';

const message: IntlMessage = {
  Basic: {
    Hello: 'Hello',
    'Hello {name}': 'Hello {name}',
    richText:
      'This is <important>important</important> and <important><very>important</very></important>',
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

it('should be print rich text', () => {
  const { container } = renderMessage('richText', {
    important: (children: React.ReactNode) => <b>{children}</b>,
    very: (children: React.ReactNode) => <i>{children}</i>,
  });

  expect(container.innerHTML).toBe('This is <b>important</b> and <b><i>important</i></b>');
});

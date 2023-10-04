import React from 'react';

import { getByText, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it } from 'vitest';

import { IntlProvider, useTranslation } from '../src';

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
            setLocale('en');
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
});

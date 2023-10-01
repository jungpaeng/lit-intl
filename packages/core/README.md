# lit-intl

[![Stable release](https://img.shields.io/npm/v/lit-intl.svg)](https://npm.im/lit-intl)

This is minimal i18n for react package.

```jsx
function Follower({user}) {
  const t = useTranslation('Follower');

  return (
    <>
      <Text>{t('latestFollower', {username: user.name})}</Text>
      <IconButton aria-label={t('followBack')} icon={<FollowIcon />} />
    </>
  );
}
```

```js
// en.json
{
  "Follower": {
    "latestFollower": "{username} started following you",
    "followBack": "Follow back"
  }
}
```

## Features

- This library is a thin wrapper around a high-quality API for i18n built on top of [Format.JS](https://formatjs.io/).
- Integrate with React with minimal configuration.

## Installation

1. Install `@lit-intl/core` in your project
2. Add the provider your top code
```jsx
import {LitIntlProvider} from '@lit-intl/core';

export default function App() {
  return (
    <LitIntlProvider messages={messages}>
      <Component {...pageProps} />
    </LitIntlProvider>
  );
}
```
3. Based on the features you need, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
4. Use translations in your components!


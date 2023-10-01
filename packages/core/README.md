# @lit-intl/core

[![Stable release](https://img.shields.io/npm/v/@lit-intl/core.svg)](https://npm.im/@lit-intl/core)

This is minimal i18n for react package.

```jsx
function Follower({ user }) {
  const t = useTranslation('Follower');

  return (
    <>
      <Text>{t('latestFollower', { username: user.name })}</Text>
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
import { LitIntlProvider } from '@lit-intl/core';

export default function App() {
  return (
    <LitIntlProvider messages={messages}>
      <Component />
    </LitIntlProvider>
  );
}
```

3. Based on the features you need, you might have to provide [polyfills](https://formatjs.io/docs/polyfills).
4. Use translations in your components!

## Usage

```js
// message
{
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
}
```

```tsx
function Component() {
  const t = useTranslation('Basic');

  return (
    <p>{t('static')}</p>
    <p>{t('simpleArgument', { name: 'world' })}</p>
    <p>{t('currency', { price: 400 })}</p>
    <p>{t('percent', { pctBlack: 0.4 })}</p>
    <p>{t('date', { start: new Date('2023-10-01') })}</p>
    <p>{t('time', { expires: new Date('2023-10-01') })}</p>
    <p>{t('select', { gender: 'male' })}</p>
    <p>{t('nestedSelect', { taxableArea: 'yes', taxRate: 0.1 })}</p>
    <p>{t('plural', { itemCount: 1 })}</p>
    <p>{t('selectordinal', { year: 1 })}</p>
    <p>
      {t('richText', {
        boldThis: (children: React.ReactNode) => <b>{children}</b>,
        link: (children: React.ReactNode) => <i>{children}</i>,
        price: 10000,
        pct: 0.1,
      })}
  </p>
  );
}
```

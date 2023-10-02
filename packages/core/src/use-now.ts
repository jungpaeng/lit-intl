import React from 'react';

import { useIntlContext } from './intl.provider';

type UseNowOptions = {
  updateInterval?: number;
};

export function useNow(options?: UseNowOptions) {
  const updateInterval = options?.updateInterval;

  const { now: globalNow } = useIntlContext();
  const [now, setNow] = React.useState(globalNow || new Date());

  React.useEffect(() => {
    if (Boolean(updateInterval) === false) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [updateInterval]);

  return now;
}

import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async function whenever `deps` change and tracks its state.
 * Pass `enabled = false` to skip the request (data resets to `null`).
 * Stale responses from earlier runs are ignored.
 */
export default function useAsync(fn, deps, enabled = true) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }
    let active = true;
    setState((s) => ({ ...s, error: null, loading: true }));
    fn()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
